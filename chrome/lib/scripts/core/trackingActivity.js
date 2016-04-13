'use strict';

import Tracker from './tracker';
import BackStore from './background-store';
import "babel-polyfill";

class TrackingActivity {
    constructor(trackings) {
        if (!trackings || trackings.length === 0) {
            throw 'Trackings required';
        }
        this.trackings = trackings;
        this.gen = this.trackingsGenerator();
        //Determines the current tracking being evaluated
        this.trackingIndex = 0;
        //Push tracking changes to this variable,
        //which at the end will be the response
        this.trackingUpdates = [];
    }

    //This is the main process
    run() {
        return new Promise((resolve, reject) => {
            this.trackingIterator(resolve, reject);
        });
    }

    trackingIterator(resolve, reject) {
        let tracking = this.gen.next().value;
        if (tracking) {
            if (!tracking.evaluated) {
                this.evaluateTracking(tracking)
                    .then((status) => {
                        this.trackingUpdates.push(...status);
                        this.trackingIterator(resolve, reject)
                    }).catch(err => reject(err));
            } else {
                this.trackingIterator(resolve, reject);
            }
        } else {
            resolve(this.trackingUpdates)
        }
    }

    //After the trackings have been setTrackings
    //This method will iterate for all of then evaluating the changes
    //This method resolve the promise
    evaluateTracking(tracking) {
        return new Promise((resolve, reject) => {
            let tracker = new Tracker(tracking.url);
            tracker.fetchPage()
                .then(() => {
                    //This includes the current tracking
                    let trackings = this.getTrackingsNotEvaluated(tracking.url);

                    let status = trackings.map(t => tracker.checkElementStatus(t.elementContent, t.elementPath));

                    trackings.forEach(t => t.evaluated = true);

                    resolve(status);
                }).catch(err => reject(err));
        });
    }

    //Get tracking for an specific url, that haven't been evaluated yet
    getTrackingsNotEvaluated(url) {
        return this.trackings.filter(t => !t.evaluated && t.url === url);
    }

    //Returns the currentTracking being evaluated and jump to the next one
    * trackingsGenerator() {
        while (this.trackingIndex < this.trackings.length) {
            yield this.trackings[this.trackingIndex];
            this.trackingIndex++;
        }
    }
}

export default TrackingActivity;
