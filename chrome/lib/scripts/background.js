/**
 * Init TrackForMe.
 */
import TrackForMe from './core';
import Actions from './actions';
import Store from './store';

let tracker = new TrackForMe();
tracker.init();

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === Actions.SNAPSHOT) {
      TakeSnapshot(sendResponse);
    } else if (request.action === Actions.LOADCONFIG) {
      sendResponse({
        config: Store.Load()
      });
    } else if (request.action === Actions.SAVECONFIG) {
      sendResponse({
        config: Store.Save(request.config)
      });
    }
    return true;
  });

//Capture Handler
function TakeSnapshot(sendResponse) {
  chrome.tabs.captureVisibleTab(null, {},
    function(dataUrl) {
      sendResponse({
        imgSrc: dataUrl
      });
    }
  );
};
