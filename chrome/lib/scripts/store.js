import store from 'amplify-store';

const storeKeys = {
  USERCONFIG: 'USERCONFIG'
};

const TrackStore = {
  load() {
    let conf = store(storeKeys.USERCONFIG) || {}
    console.log('loading', conf);
    return conf;
  },
  save(config) {
    console.log('saving', config);
    return store(storeKeys.USERCONFIG, config);
  }
};

export default TrackStore;
