/**
 * Init TrackForMe.
 */
import TrackForMe from './core';

var tracker = new TrackForMe();
tracker.init();

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    chrome.tabs.captureVisibleTab(
      null, {},
      function(dataUrl) {
        sendResponse({
          imgSrc: dataUrl
        });
      }
    ); //remember that captureVisibleTab() is a statement
    return true;
  }
);
