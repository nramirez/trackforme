/**
 * Init TrackForMe.
 */
import TrackForMe from './core/trackforme';
import Actions from './core/actions';
import Store from './core/store';
import TrackingActivity from './core/TrackingActivity';

let tracker = new TrackForMe();
tracker.init();

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
        } else if (request.action === Actions.SAVESITES) {
            tracker.reload();
            chrome.tabs.getSelected(null, function(tab) {
                chrome.tabs.reload(tab.id);
            });
            Store.SaveSites(request.sites, sendResponse);
        } else if (request.action === Actions.SAVECURRENTTRACKING) {
            tracker.setBadge(Object.keys(request.currentTracking).length);

            sendResponse({
                currentTracking: Store.SaveCurrentTracking(request.currentTracking)
            });
        } else if (request.action === Actions.LOADCURRENTTRACKING) {
            sendResponse({
                currentTracking: Store.LoadCurrentTracking()
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
        } else {
            sendResponse('Error: Action not defined');
        }
        //http://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
        return true;
    });

const TrackingRunner = () => {
  return new Promise((resolve, reject) {
    var trackings = Store.Load((config) {
      //Here we will later add notifications
      new TrackingActivity(config.trackings).run().then(resolve).catch(reject);
    });
  });
};

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
