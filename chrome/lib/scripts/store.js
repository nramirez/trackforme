import amplify from 'amplify-store';

const USERCONFIG = 'USERCONFIG';

const Store = {
  Load() {
    let conf = amplify(USERCONFIG) || {}
    console.log('loading', conf);
    return conf;
  },
  Save(config) {
    console.log('saving', config);
    return amplify(USERCONFIG, config);
  }
};

export default Store;
