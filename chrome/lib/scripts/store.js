import amplify from 'amplify-store';
import $ from 'jquery';

const ServerBaseUrl = 'http://localhost:8000';
const USERCONFIG = 'USERCONFIG';
const CURRENTRACKING = 'CURRENTRACKING';

const Store = {
  Load(callback) {
    //By default try to local storage, in case the ajax request fails
    let config = amplify(USERCONFIG) || {};
    if (config.email) {
      //Try to load the user info from the server
      $.get(`${ServerBaseUrl}/users/${config.email}`, (response) => {
        config = response;
        //Update localstorage
        amplify(USERCONFIG, config);
      }).always(function() {
        //Return config, either was loaded from the server or the local storage
        callback(config);
      });
    }
  },

  SaveCurrentTracking(trackingElements) {
    console.log('saving tracking in progress', trackingElements);
    return amplify(CURRENTRACKING, trackingElements);
  },

  LoadCurrentTracking() {
    return amplify(CURRENTRACKING);
  },

  SaveSites(sites, callback) {
    let config = amplify(USERCONFIG);
    if (!config || !config.email) {
      callback(false);
    } else {
      $.post(`${ServerBaseUrl}/site`, {
        email: config.email,
        sites: sites
      }, (response) => {
        console.log(response);
        callback(true);
      });
    }
  },

  SaveImage(image, callback) {
    $.post(`${ServerBaseUrl}/sites/image`, {
      image: image
    }, (url) => {
      callback(null, url);
    });

  },

  SaveConfig(config) {
    return amplify(USERCONFIG, config)
  },

  SaveUserSettings(email, callback) {
    let user = {
      email: email
    };
    $.post(`${ServerBaseUrl}/users`, {
      user: user
    }).always(() => {
      this.SaveConfig({
        email: email
      });
    });
  }
};

export default Store;
