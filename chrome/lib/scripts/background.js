/**
 * Init TrackForMe.
 */
import TrackForMe from './core/trackforme';
import Actions from './core/actions';
import Store from './core/store';
import TrackingRunner from './core/trackingRunner';

let currentTabId;
let tracker = new TrackForMe();

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === Actions.SNAPSHOT) {
            TakeSnapshot(sendResponse);
        } else if (request.action === Actions.LOADUSERSETTINGS) {
            Store.LoadUserSettings((response) => {
                sendResponse({
                    config: response
                });
            });
        } else if (request.action === Actions.POSTTRACKINGS) {
            Store.PostTrackings(request.trackings, () => {
                ReloadExtension(true);
                sendResponse();
            });
        } else if (request.action === Actions.SAVECURRENTTRACKINGS) {
            tracker.setBadge(request.currentTrackings.length);

            sendResponse({
                currentTrackings: Store.SaveCurrentTrackings(request.currentTrackings)
            });
        } else if (request.action === Actions.LOADCURRENTTRACKING) {
            sendResponse({
                currentTrackings: Store.LoadCurrentTracking()
            });
        } else if (request.action === Actions.SAVEUSERSETTINGS) {
            Store.SaveUserSettings(request.userSettings, sendResponse);
        } else if (request.action === Actions.RUNTRACKING) {
            TrackingRunner().then(response => {
                console.log('tracking completed', response);
                sendResponse(response);
            }).catch(err => {
                console.log('Error running tracking', err);
                sendResponse(err);
            });
        } else if (request.action === Actions.STARTTRACKING) {
            chrome.tabs.getSelected(null, function(tab) {
                currentTabId = tab.id;
            });
            tracker.startTracking();
            return false;
        } else if (request.action === Actions.ISTRACKING) {
            sendResponse({
                isTracking: tracker.isTracking()
            });
        } else if (request.action === Actions.RELOAD) {
            ReloadExtension(true);
        } else {
            sendResponse('Error: Action not defined');
        }
        //http://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
        return true;
    });

chrome.tabs.onRemoved.addListener(tabId => {
    if (tabId === currentTabId)
        ReloadExtension();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (tabId === currentTabId && changeInfo.status === 'loading')
        ReloadExtension();
});

chrome.windows.onRemoved.addListener(ReloadExtension);

const ReloadExtension = (reloadCurrentTab = false) => {
    Store.SaveCurrentTrackings(null);
    tracker.reload();
    if (reloadCurrentTab)
        chrome.tabs.reload(currentTabId);
};

//Capture Handler
const TakeSnapshot = (sendResponse) => chrome.tabs.captureVisibleTab(null, {},
    (image) => Store.SaveImage(image, (err, imageUrl) => sendResponse({
        err: err,
        imgSrc: imageUrl
    })));
