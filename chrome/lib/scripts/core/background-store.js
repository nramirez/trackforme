import Actions from './actions';

const BackgroundStore = {
    LoadUserSettings(callback) {
        chrome.runtime.sendMessage({
            action: Actions.LOADUSERSETTINGS
        }, callback);
    },

    PostTrackings(sites, callback) {
        chrome.runtime.sendMessage({
            action: Actions.SAVESITES,
            sites: sites
        }, callback);
    },

    SaveCurrentTracking(currentTracking) {
        console.log('saving current tracking', currentTracking);
        chrome.runtime.sendMessage({
            action: Actions.SAVECURRENTTRACKING,
            currentTracking: currentTracking,
        });
    },

    LoadCurrentTracking(callback) {
        chrome.runtime.sendMessage({
            action: Actions.LOADCURRENTTRACKING
        }, callback);
    },

    SaveUserSettings(userSettings) {
        chrome.runtime.sendMessage({
            action: Actions.SAVEUSERSETTINGS,
            userSettings: userSettings
        });
    },

    RunTracking() {
        chrome.runtime.sendMessage({
            action: Actions.RUNTRACKING
        });
    }
};

export default BackgroundStore;
