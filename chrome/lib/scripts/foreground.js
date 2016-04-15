import BackStore from './core/background-store';
import Actions from './core/actions';

let currentTrackings = {};
let prevElement = null;
const highlightClass = 'trackforme-highlight';
const clickHandlerTimeout = 500;
let clickEventInProgress = false;

const fullPath = (el) => {
    let names = [], c, e;
    while (el.parentNode) {
        if (el.id) {
            names.unshift('#' + el.id);
            break;
        } else {
            if (el == el.ownerDocument.documentElement) names.unshift(el.tagName);
            else {
                for (c = 1, e = el; e.previousElementSibling; e = e.previousElementSibling, c++);

                names.unshift(el.tagName + ":nth-child(" + c + ")");
            }
            el = el.parentNode;
        }
    }
    return names.join(" > ");
}

const handleClick = (element) => {
    if (clickEventInProgress)
        return;

    clickEventInProgress = true;
    //Avoid this method to be called multiple times
    setTimeout(() => clickEventInProgress = false, clickHandlerTimeout);

    let tracking = {
        elementPath: fullPath(element),
        url: window.location.href,
        elementContent: element.innerHTML
    };

    currentTrackings[tracking.elementPath] = tracking;
    //This will save the tracking inmediately in the localstorage
    BackStore.SaveCurrentTracking(currentTrackings);

    chrome.runtime.sendMessage({
        action: Actions.SNAPSHOT
    }, (response) => {
        currentTrackings[tracking.elementPath].img = response.imgSrc;
        //This will update the saved tracking with the image url
        BackStore.SaveCurrentTracking(currentTrackings);
    });
}

document.addEventListener('mouseover', (event) => {
    let target = event.target;

    if (prevElement)
        prevElement.className = prevElement.className.replace(/\btrackforme-highlight\b/, '');

    target.className = target.className ? target.className + ' ' + highlightClass : highlightClass;
    prevElement = target;
}, true);

document.addEventListener('mousedown', (event) => {
    event.preventDefault();
    handleClick(prevElement);
}, true);
