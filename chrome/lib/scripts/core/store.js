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
        console.log(trackings);

        // This will ensure that we always persist an array
        trackings = this._trackingsToArray(trackings);

        //without email, save it locally in the USERCONFIG
        if (!config.email || !trackings || !trackings.length) {
            if (trackings && trackings.length) {
                if (config.trackings) {
                    config.trackings.push(...trackings);
                } else {
                    config.trackings = trackings;
                }
                this._saveUserConfig(config);
            }
            callback(false);
        } else {
            let trackingPayload = {
                email: config.email,
                trackings: trackings
            };
            $.post(`${ServerBaseUrl}/trackings`, {
                trackingPayload: trackingPayload
            }, (response) => {
                callback(true);
            });
        }
    },

    // Convert Trackings to Array
    _trackingsToArray(trackings) {
        if (!trackings)
            return null;

        if(Array.isArray(trackings))
            return trackings;

        let keys = Object.keys(trackings);
        return keys.map(k => trackings[k]);
    },

    SaveImage(image, callback) {
        $.post(`${ServerBaseUrl}/trackings/image`, {
            image: image
        }, (url) => {
            callback(null, url);
        });

    },

    _saveUserConfig(config) {
        return amplify(USERCONFIG, config);
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
                this.PostTrackings(this.LoadCurrentTracking(), callback);
            });
        }
    },

    // Use for the tracking activity to update the lastScanDate and the Status
    updateTrackingsStatus(trackings) {
        let config = amplify(USERCONFIG);

        if (!config.trackings || config.trackings.length === 0)
            return;

        trackings.forEach(tracking => {
            let configTracking = config.trackings.find(t => t.elementPath === tracking.elementPath);
            if (configTracking) {
                configTracking.status = tracking.status;
                configTracking.lastScanDate = tracking.lastScanDate;
            }
        });

        console.log('trackings updated', trackings);

        this._saveUserConfig(config);
        //TODO: Should we post the updates to the server?
    }
};

export default Store;
