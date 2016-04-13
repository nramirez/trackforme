import amplify from 'amplify-store';
import $ from 'jquery';

const ServerBaseUrl = 'http://localhost:8000';
const USERCONFIG = 'USERCONFIG';
const CURRENTRACKING = 'CURRENTRACKING';

const Store = {
  LoadUserSettings(callback) {
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
    } else {
      callback(config);
    }
  },

  //Save tracking in the local storage
  SaveCurrentTracking(trackingElements) {
    console.log('saving tracking in progress', trackingElements);
    return amplify(CURRENTRACKING, trackingElements);
  },

  //Load tracking in the local storage
  LoadCurrentTracking() {
    return amplify(CURRENTRACKING);
  },

  //Persist trackings on the server
  PostTrackings(trackings, callback) {
    let config = amplify(USERCONFIG) || {};
    // but first, save it local in the USERCONFIG
    config.trackings = trackings;
    amplify(USERCONFIG, config);

    console.log(trackings);
    if (!config || !config.email || !trackings) {
      callback(false);
    } else {
      let trackingPayload = {
        email: config.email,
        trackings: trackings
      };
      $.post(`${ServerBaseUrl}/trackings`, {
        trackingPayload: trackingPayload
      }, (response) => {
        console.log(response);
        //clean the currentTrackings to avoid duplications
        this.SaveCurrentTracking(null);
        callback(true);
      });
    }
  },

  SaveImage(image, callback) {
    $.post(`${ServerBaseUrl}/trackings/image`, {
      image: image
    }, (url) => {
      callback(null, url);
    });

  },

  _saveUserConfig(config) {
    return amplify(USERCONFIG, config)
  },

  SaveUserSettings(userSettings, callback) {
    if (!userSettings.email) {
      callback(false);
    } else {
      $.post(`${ServerBaseUrl}/users`, {
        email: userSettings.email,
        trackingTime: userSettings.trackingTime
      }).always(() => {
        this._saveUserConfig({
          email: userSettings.email,
          trackingTime: userSettings.trackingTime
        });
        //save the currentTrackings in the server
        this.PostTrackings(this.LoadCurrentTracking());
        callback(true);
      });
    }
  }
};

export default Store;
