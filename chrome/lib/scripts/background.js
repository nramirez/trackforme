/**
 * Init TrackForMe.
 */
import TrackForMe from './core/trackforme';
import Actions from './core/actions';
import Store from './core/store';
import TrackingRunner from './core/trackingRunner';

let currentTabId;
let trackingTimeout;
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
            Store.SaveUserSettings(request.userSettings, () => {
                Store.LoadUserSettings((config) => {
                    initTrackingRunner(config);
                    sendResponse(config);
                });
            });
        } else if (request.action === Actions.RUNTRACKING) {
            TrackingRunner.run().then(response => {
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

const triggerRunner = (timeInMinutes) => {
    console.log(`triggering the runner at ${new Date()} with a timeout of ${timeInMinutes}`)
    let timeInMilliSeconds = timeInMinutes * 60 * 1000;
    TrackingRunner.run()
        .then(response => {
            trackingTimeout = setTimeout(() => triggerRunner(timeInMinutes), timeInMilliSeconds)
                //TODO: maybe this is the moment to notify the user
        })
        .catch(err => {
            trackingTimeout = setTimeout(() => triggerRunner(timeInMinutes), timeInMilliSeconds)
                //TODO: Notify the server about the error, so we can track it down
        });
};

const initTrackingRunner = (config) => {
    if (trackingTimeout) {
        // Just in case there's another timeout instantiated
        clearTimeout(trackingTimeout);
    }
    // Init the runner only if the user has a trackingTime set
    if (config && config.trackingTime &&
        Number(config.trackingTime) > 0 &&
        config.trackings &&
        config.trackings.length) {
        triggerRunner(Number(config.trackingTime));
    }
}

// Initialize the runner when the chrome starts
Store.LoadUserSettings(initTrackingRunner);
