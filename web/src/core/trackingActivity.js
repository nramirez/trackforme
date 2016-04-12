'use strict';

import Tracker from './tracker.js';
import Tracking from '../models/tracking.js';
import "babel-polyfill";

class TrackingActivity {
    constructor() {
        this.trackings = [];
        //Determines the current tracking being evaluated
        this.trackingIndex = 0;
        //Push tracking changes to this variable,
        //which at the end will be the response
        this.trackingUpdates = [];
    }

    //This is the main process
    run() {
        return new Promise((resolve, reject) => {
            this.setTrackings()
                .then(s => this.evaluateTrackings(resolve, reject))
                .catch(err => reject(err));
        });
    }

    //Here resides the filter for the trackings that will be evaluated
    setTrackings() {
        return new Promise((resolve, reject) => {
            //Add the filter criteria for the trackings to inspect
            Tracking.find({}, (err, trackings) => {
                if (err) {
                    reject(err);
                } else {
                    this.trackings = trackings;
                    this.currentTrackingsGen = this.trackingsGenerator();
                    resolve(trackings)
                }
            });
        });
    }

    //Returns the currentTracking being evaluated and jump to the next one
    * trackingsGenerator() {
        while(this.trackingIndex < this.trackings.length) {
            yield this.trackings[this.trackingIndex];
            this.trackingIndex++;
        }
    }

    //After the trackings have been setTrackings
    //This method will iterate for all of then evaluating the changes
    //This method resolve the promise
    evaluateTrackings(resolve, reject) {
        let tracking = this.currentTrackingsGen.next().value;
        if (tracking) {
            let tracker = new Tracker(tracking.url);
            tracker.fetchPage()
                .then(f => {
                    let status = tracker.checkElementStatus(tracking.elementContent, tracking.elementPath);
                    this.trackingUpdates.push(status);
                    this.evaluateTrackings(resolve, reject);
                }).catch(err => reject(err));
        } else {
            resolve(this.trackingUpdates);
        }
    }
}

export default TrackingActivity;
