import Actions from './actions';

const BackgroundStore = {
  Load(callback) {
    chrome.runtime.sendMessage({
      action: Actions.LOADCONFIG
    }, callback);
  },
  SaveTrack(sites) {
    chrome.runtime.sendMessage({
      action: Actions.SAVESITES,
      sites: sites
    });
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
  }
};

export default BackgroundStore;
