import BackStore from './background-store';
import Actions from './actions';

let config = {};
let prevElement = null;
const highlightClass = 'trackforme-highlight';
const matchingElements = '(?:DIV|P|LI|OL|UL|TD|TR|TABLE|H[1-6])';

BackStore.Load(function(response) {
  config = response.config;
  config.currentTracking = {};
});

function validElement(el) {
  return (el.nodeName.match(matchingElements) && !el.style.background_image) || !el.parentNode;
}

function findCloserMatchingParent(el) {
  if (!el) return null;

  while (!validElement(el)) {
    el = el.parentNode;
  }
  return el;
}

function fullPath(el) {
  let names = [];
  while (el.parentNode) {
    if (el.id) {
      names.unshift('#' + el.id);
      break;
    } else {
      if (el == el.ownerDocument.documentElement) names.unshift(el.tagName);
      else {
        for (var c = 1, e = el; e.previousElementSibling; e = e.previousElementSibling, c++);
        names.unshift(el.tagName + ":nth-child(" + c + ")");
      }
      el = el.parentNode;
    }
  }
  return names.join(" > ");
}

function handleCurrentElementClick(event) {
  event.preventDefault();
  console.log('clicked');
  let row = {
    path: fullPath(event.target),
    url: window.location.href
  };

  chrome.runtime.sendMessage({
    action: Actions.SNAPSHOT
  }, function(response) {
    row.img = response.imgSrc;
    config.currentTracking[row.path] = row;
    
    BackStore.Save(config);
  });
}

document.querySelector('body')
  .addEventListener("mouseover", function(e) {
    let currentEl = findCloserMatchingParent(e.relatedTarget);

    if (prevElement == currentEl || !currentEl) return;

    if (prevElement) {
      prevElement.className = prevElement.className.replace(/\btrackforme-highlight\b/, '');
    }

    prevElement = currentEl;

    currentEl.addEventListener('click', handleCurrentElementClick);

    currentEl.className = currentEl.className ? currentEl.className + ' ' + highlightClass : highlightClass;
  });
