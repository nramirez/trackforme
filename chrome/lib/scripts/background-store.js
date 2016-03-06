import Actions from './actions';

const BackgroundStore = {
  Load(callback) {
    chrome.runtime.sendMessage({
      action: Actions.LOADCONFIG
    }, callback);
  },
  Save(config) {
    chrome.runtime.sendMessage({
      action: Actions.SAVECONFIG,
      config: config
    });
  }
};

export default BackgroundStore;
