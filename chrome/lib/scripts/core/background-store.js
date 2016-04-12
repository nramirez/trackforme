import Actions from './actions';

const BackgroundStore = {
    Load(callback) {
        chrome.runtime.sendMessage({
            action: Actions.LOADCONFIG
        }, callback);
    },

    SaveTrack(sites, callback) {
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
    }
};

export default BackgroundStore;
