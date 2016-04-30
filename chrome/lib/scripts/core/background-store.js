import Actions from './actions';

const BackgroundStore = {
    LoadUserSettings(callback) {
        chrome.runtime.sendMessage({
            action: Actions.LOADUSERSETTINGS
        }, callback);
    },

    PostTrackings(trackings, callback) {
        chrome.runtime.sendMessage({
            action: Actions.POSTTRACKINGS,
            trackings: trackings
        }, callback);
    },

    SaveCurrentTracking(currentTrackings) {
        chrome.runtime.sendMessage({
            action: Actions.SAVECURRENTTRACKING,
            currentTrackings: currentTrackings,
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
    },

    StartTracking() {
        chrome.runtime.sendMessage({
            action: Actions.STARTTRACKING
        });
    },

    IsTracking(callback) {
        chrome.runtime.sendMessage({
            action: Actions.ISTRACKING
        }, callback);
    },

    Reload() {
        chrome.runtime.sendMessage({
            action: Actions.RELOAD
        });
    }
};

export default BackgroundStore;
