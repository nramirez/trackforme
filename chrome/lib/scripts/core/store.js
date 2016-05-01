import amplify from 'amplify-store';
import $ from 'jquery';

const ServerBaseUrl = 'http://localhost:8000';
const USERCONFIG = 'USERCONFIG';
const CURRENTRACKING = 'CURRENTRACKING';

const Store = {
    // Load user config from the local storage
    _getLocalConfig() {
        //By default try to local storage, in case the ajax request fails
        //Set trackingTime to 15 minutes by default
        return amplify(USERCONFIG) || {
            trackingTime: '1'
        };
    },

    // Save User config in the local storage
    _saveLocalConfig(config) {
        return amplify(USERCONFIG, config);
    },

    LoadUserSettings(callback) {
        let config = this._getLocalConfig();
        if (config.email) {
            //Try to load the user info from the server
            $.get(`${ServerBaseUrl}/users/${config.email}`, (response) => {
                config = response;
                //Update localstorage
                this._saveLocalConfig(config);
            }).always(function() {
                //Return config, either was loaded from the server or the local storage
                callback(config);
            });
        } else {
            callback(config);
        }
    },

    //Save tracking in the local storage
    SaveCurrentTrackings(trackingElements) {
        console.log('saving tracking in progress', trackingElements);
        return amplify(CURRENTRACKING, trackingElements);
    },

    // img: Is a unique identifier that all the trackings must have, id is only  for trackings saved in the db.
    DeleteTracking(img, callback) {
        let config = amplify(USERCONFIG) || {};
        let trackings = config.trackings;
        let trackingToDelete = trackings.find((t) => {
            return t.img === img;
        });

        if (trackingToDelete._id) {
            $.ajax({
                url: `${ServerBaseUrl}/trackings/`,
                type: 'DELETE',
                data: {
                    email: config.email,
                    tracking: trackingToDelete
                }
            }).fail(err => {
                console.log('server fail to delete', err);
                callback(false);
            });
        } else {
            this._deleteLocalTracking(img);
            callback(true);
        }
        callback(true);
    },

    _deleteLocalTracking(img) {
        let config = this._getLocalConfig();
        config.trackings = config.trackings.filter(t => t.img != img);
        this._saveLocalConfig(config);
    },

    //Load tracking in the local storage
    LoadCurrentTracking() {
        return amplify(CURRENTRACKING);
    },

    //Persist trackings on the server
    PostTrackings(trackings, callback) {
        let config = this._getLocalConfig();

        //without email, save it locally in the USERCONFIG
        if (!config.email || !trackings || !trackings.length) {
            if (trackings && trackings.length) {
                if (config.trackings) {
                    config.trackings.push(...trackings);
                } else {
                    config.trackings = trackings;
                }
                this._saveLocalConfig(config);
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

    SaveImage(image, callback) {
        $.post(`${ServerBaseUrl}/trackings/image`, {
            image: image
        }, (url) => {
            callback(null, url);
        });
    },

    SaveUserSettings(userSettings, callback) {
        if (!userSettings.email) {
            callback(false);
        } else {
            $.post(`${ServerBaseUrl}/users`, {
                email: userSettings.email,
                trackingTime: userSettings.trackingTime
            }).always(() => {
                let config = this._getLocalConfig();
                // This happens when it's the very first time that the user is setting the email
                const needsToPostLocalTrackings = !config.email;

                // Update config settings
                config.email = userSettings.email;
                config.trackingTime = userSettings.trackingTime;
                // Persist this settings locally
                this._saveLocalConfig(config);

                if (needsToPostLocalTrackings) {
                    //send trackings saved until now to the server
                    this.PostTrackings(config.trackings, callback);
                } else {
                    callback(true);
                }
            });
        }
    },

    // Use for the tracking activity to update the lastScanDate and the Status
    updateTrackingsStatus(trackings) {
        let config = this._getLocalConfig();

        if (!config.trackings || config.trackings.length === 0)
            return;

        trackings.forEach(tracking => {
            let configTracking = config.trackings.find(t => t.elementPath === tracking.elementPath);
            if (configTracking) {
                configTracking.lastScanStatus = tracking.lastScanStatus;
                configTracking.lastScanDate = tracking.lastScanDate;
                // For now I will always notify the server but #91 will add some control about when to update it
                this.putTrackingStatus(config.email, tracking);
            }
        });

        this._saveLocalConfig(config);
    },

    putTrackingStatus(userEmail, tracking) {
        // For local tracking we don't have to notify the server
        if (!userEmail)
            return;

        $.ajax({
            url: `${ServerBaseUrl}/trackings/statusupdate`,
            type: 'PUT',
            data: {
                email: userEmail,
                tracking: tracking
            }
        });
    }
};

export default Store;
