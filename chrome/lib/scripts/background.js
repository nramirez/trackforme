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
    function(request, sender, callback) {
        if (request.action === Actions.SNAPSHOT) {
            TakeSnapshot(callback);
        } else if (request.action === Actions.LOADUSERSETTINGS) {
            Store.LoadUserSettings(response => {
                callback({
                    config: response
                });
            });
        } else if (request.action === Actions.POSTTRACKINGS) {
            Store.PostTrackings(request.trackings, config => {
                ReloadExtension(true);
                Store.LoadUserSettings(config => {
                    initTrackingRunner(config);
                    callback(config);
                });
            });
        } else if (request.action === Actions.SAVECURRENTTRACKINGS) {
            tracker.setBadge(request.currentTrackings.length);

            callback({
                currentTrackings: Store.SaveCurrentTrackings(request.currentTrackings)
            });
        } else if (request.action === Actions.DELETETRACKING) {
            Store.DeleteTracking(request.img, callback);
        } else if (request.action === Actions.LOADCURRENTTRACKING) {
            callback({
                currentTrackings: Store.LoadCurrentTracking()
            });
        } else if (request.action === Actions.SAVEUSERSETTINGS) {
            Store.SaveUserSettings(request.userSettings, () => {
                Store.LoadUserSettings(config => {
                    initTrackingRunner(config);
                    callback(config);
                });
            });
        } else if (request.action === Actions.RUNTRACKING) {
            TrackingRunner.run().then(response => {
                console.log('tracking completed', response);
                callback(response);
            }).catch(err => {
                console.log('Error running tracking', err);
                callback(err);
            });
        } else if (request.action === Actions.STARTTRACKING) {
            chrome.tabs.getSelected(null, function(tab) {
                currentTabId = tab.id;
            });
            tracker.startTracking();
            return false;
        } else if (request.action === Actions.ISTRACKING) {
            callback({
                isTracking: tracker.isTracking()
            });
        } else if (request.action === Actions.RELOAD) {
            ReloadExtension(true);
        } else {
            callback('Error: Action not defined');
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
const TakeSnapshot = (callback) => chrome.tabs.captureVisibleTab(null, {},
    (image) => Store.SaveImage(image, (err, imageUrl) => callback({
        err: err,
        imgSrc: imageUrl
    })));

/**
 * Instantiate the TrackingRunner and recursevily call itself every {timeInMinutes}
 *
 * @param int timeInMinutes : How frequent the tracker has to run.
 */
const triggerRunner = (timeInMinutes) => {
    console.log(`triggering the runner at ${new Date()} with a timeout of ${timeInMinutes}`)
    let timeInMilliSeconds = timeInMinutes * 60 * 1000;
    TrackingRunner.run()
        .then(changedTrackings => {
            trackingTimeout = setTimeout(() => triggerRunner(timeInMinutes), timeInMilliSeconds);
            if (changedTrackings && changedTrackings.length > 0)
                DisplayNotification('You have new tracking updates!');
        })
        .catch(err => {
            trackingTimeout = setTimeout(() => triggerRunner(timeInMinutes), timeInMilliSeconds)
                //TODO: Notify the server about the error, so we can track it down
        });
};

/**
 * Push chrome notifications to the user
 *
 * @param string message : Body message of the notification
 * @param string title (optional) : Title message of the notification, 'TrackForMe - Updates' if not present.
 */
const DisplayNotification = (message, title) => {
    title = title || 'TrackForMe - Updates';
    chrome.notifications.create(null, {
        type: 'basic',
        iconUrl: 'img/default-icon.png',
        title: 'TrackForMe - Updates',
        message: message
    });
};

// If the user clicks on the notification
// This sends them to the app options
chrome.notifications.onClicked.addListener(notificationId => {
    chrome.tabs.create({
        url: chrome.extension.getURL('/views/options.html')
    });
    chrome.notifications.clear(notificationId);
});

/**
 * Initializes the TrackingRunner trigger
 *
 * @param object config : current configuration
 */
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
};

// Initialize the runner when the chrome starts
Store.LoadUserSettings(initTrackingRunner);
