import Store from './store';

var config = Store.load();

var prevElement = null;
var highlightClass = 'trackforme-highlight';
var matchingElements = '(?:DIV|P|LI|OL|UL|TD|TR|TABLE|H[1-6])';
config.currentTracking = {};

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
  var names = [];
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
  var row = {
    path: fullPath(event.target),
    url: window.location.href
  };

  chrome.runtime.sendMessage({msg: "capture"}, function(response) {
    row.img = response.imgSrc;
    config.currentTracking[row.path] = row;
    Store.save(config);
  });
}

document.querySelector('body')
  .addEventListener("mouseover", function(e) {
    var currentEl = findCloserMatchingParent(e.relatedTarget);

    if (prevElement == currentEl || !currentEl) return;

    if (prevElement) {
      prevElement.className = prevElement.className.replace(/\btrackforme-highlight\b/, '');
    }

    prevElement = currentEl;

    currentEl.addEventListener('click', handleCurrentElementClick);

    currentEl.className = currentEl.className ? currentEl.className + ' ' + highlightClass : highlightClass;
  });
