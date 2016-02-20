var prevElement = null;
var highlightClass = 'trackforme-highlight';
var matchingElements = '(?:DIV|P|LI|OL|UL|TD|TR|TABLE|H[1-6])';


function validElement(el) {
  return (el.nodeName.match(matchingElements) && !el.style.background_image)
    || !el.parentNode;
}

function findCloserMatchingParent(el) {
  if (!el) return null;

  while (!validElement(el)) {
    el = el.parentNode;
  }

  return el;
}

document.querySelector('body')
  .addEventListener("mouseover", function(e) {
    var currentEl = findCloserMatchingParent(e.relatedTarget);

    if (prevElement == currentEl || !currentEl) return;

    if (prevElement) {
      prevElement.className = prevElement.className.replace(/\btrackforme-highlight\b/, '');
    }

    prevElement = currentEl;

    currentEl.className = currentEl.className
    ? currentEl.className + ' ' + highlightClass
    : highlightClass;
  });
