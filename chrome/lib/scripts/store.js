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
        } else {
            config = {
                email: "",
                trackingTime: "",
                sites: this.LoadCurrentTracking()
            };
            callback(config);
        }
    },

    SaveCurrentTracking(trackingElements) {
        console.log('saving tracking in progress', trackingElements);
        return amplify(CURRENTRACKING, trackingElements);
    },

    LoadCurrentTracking() {
        return amplify(CURRENTRACKING);
    },

    SaveSites(trackings, callback) {
        let config = amplify(USERCONFIG);
        console.log(trackings);
        if (!config || !config.email || !trackings) {
            callback(false);
        } else {
            let trackingPayload = {
                email: config.email,
                trackings: trackings
            };
            $.post(`${ServerBaseUrl}/sites`, {
                trackingPayload: trackingPayload
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

    _saveUserConfig(config) {
        return amplify(USERCONFIG, config)
    },

    SaveUserSettings(userSettings, callback) {
        $.post(`${ServerBaseUrl}/users`, {
            email: userSettings.email,
            trackingTime: userSettings.trackingTime
        }).always(() => {
            this._saveUserConfig({
                email: userSettings.email,
                trackingTime: userSettings.trackingTime
            });
            let currentTracking = this.LoadCurrentTracking();
            if (currentTracking) {
                this.SaveSites(currentTracking);
            }
        });
    }
};

export default Store;
