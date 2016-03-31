import amplify from 'amplify-store';
import $ from 'jquery';

const ServerBaseUrl = 'http://localhost:8000';
const USERCONFIG = 'USERCONFIG';
const CURRENTRACKING = 'CURRENTRACKING';
const USEREMAIL = 'ram.nazaret@gmail.com';

const Store = {
  Load(callback) {
    //By default try to local storage, in case the ajax request fails
    let config = amplify(USERCONFIG) || {
      email: USEREMAIL
    };
    //Try to load the user info from the server
    $.get(`${ServerBaseUrl}/userinfo/${USEREMAIL}`, (response) => {
      config = response;
      //Update localstorage
      amplify(USERCONFIG, config);
    }).always(function() {
      //Return config, either was loaded from the server or the local storage
      callback(config);
    });
  },
  SaveCurrentTracking(trackingElements) {
    console.log('saving tracking in progress', trackingElements);
    return amplify(CURRENTRACKING, trackingElements);
  },
  LoadCurrentTracking() {
    return amplify(CURRENTRACKING);
  },
  SaveSites(sites, callback) {
    $.post(`${ServerBaseUrl}/site`, {
      email: USEREMAIL,
      sites: sites
    }, (response) => {
      console.log(response);
      callback(true);
    });
  },
  SaveImage(image, callback){
    $.post(`${ServerBaseUrl}/sites/image`, {
        image: image
    }, (url) => {
      callback(null, url);
    });

  }
};

export default Store;
