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
            Store.Load((response) => {
                sendResponse({
                    config: response
                });
            });
        } else if (request.action === Actions.SAVESITES) {
            tracker.reload();
            chrome.tabs.getSelected(null, function(tab) {
                chrome.tabs.reload(tab.id);
            });
            Store.SaveSites(request.sites, sendResponse);
        } else if (request.action === Actions.SAVECURRENTTRACKING) {
            sendResponse({
                currentTracking: Store.SaveCurrentTracking(request.currentTracking)
            });
        } else if (request.action === Actions.LOADCURRENTTRACKING) {
            sendResponse({
                currentTracking: Store.LoadCurrentTracking()
            });
        } else if (request.action === Actions.SAVEUSERSETTINGS) {
            Store.SaveUserSettings(request.email, sendResponse);
        } else {
            sendResponse('Error: Action not defined');
        }
        //http://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
        return true;
    });

//Capture Handler
function TakeSnapshot(sendResponse) {
  chrome.tabs.captureVisibleTab(null, {},
    (image) => {
        Store.SaveImage(image, (err, imageUrl) => {
            if(err) sendResponse({err: err});
            else
                sendResponse({
                    imgSrc: imageUrl
                });
        });
    }
  );
};
