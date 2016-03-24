import BackStore from './background-store';
import Actions from './actions';

let currentTracking = {};
let prevElement = null;
const highlightClass = 'trackforme-highlight';
const matchingElements = '(?:DIV|P|LI|OL|UL|TD|TR|TABLE|H[1-6])';
const clickHandlerTimeout = 500;
let clickEventInProgress = false;

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
  if (clickEventInProgress) {
    return;
  }
  clickEventInProgress = true;
  //Avoid this method to be called multiple times,
  //This wouldn't be needed if we could figure out
  //how to attach the event only once
  setTimeout(function() {
    clickEventInProgress = false;
  }, clickHandlerTimeout);
  let row = {
    path: fullPath(event.target),
    url: window.location.href
  };

  chrome.runtime.sendMessage({
    action: Actions.SNAPSHOT
  }, function(response) {
    row.img = response.imgSrc;
    currentTracking[row.path] = row;
    BackStore.SaveCurrentTracking(currentTracking);
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
