'use strict';

import 'babel-polyfill';
import TrackingStatus from './trackingStatus';

class TrackingActivity {
    constructor(trackings, store, tracker) {
        if (!trackings || trackings.length === 0)
            throw 'Trackings required';

        if (!store)
            throw 'Required store';

        this.Tracker = tracker;

        this.Store = store;
        this.trackings = trackings;
        this.currentTrackingsGen = this.trackingsGenerator();
        //Determines the current tracking being evaluated
        this.trackingIndex = 0;
    }

    //This is the main process
    run() {
        return new Promise((resolve, reject) => {
            this.trackingIterator(resolve, reject);
        });
    }

    // Handle the iterations through the trackings
    trackingIterator(resolve, reject) {
        let tracking = this.currentTrackingsGen.next().value;
        if (tracking) {
            if (!tracking.evaluated) {
                this.evaluateTracking(tracking)
                    .then(() => {
                        this.trackingIterator(resolve, reject);
                    }).catch(err => reject(err));
            } else {
                this.trackingIterator(resolve, reject);
            }
        } else {
            var trackingThatChanged = this.getChangedTrackings();
            resolve(trackingThatChanged);
        }
    }

    //After the trackings have been setTrackings
    //This method will iterate for all of then evaluating the changes
    //This method resolve the promise
    evaluateTracking(tracking) {
        return new Promise((resolve, reject) => {
            let tracker = new this.Tracker(tracking.url);
            tracker.fetchPage()
                .then(() => {
                    //This includes the current tracking
                    let trackings = this.getTrackingsNotEvaluated(tracking.url);

                    trackings.forEach(t => {
                        t.lastScanStatus = tracker.checkElementStatus(t.elementContent, t.elementPath);
                        t.evaluated = true;
                        t.lastScanDate = new Date();
                    });

                    this.updateTrackingsStatus(trackings);

                    resolve();
                }).catch(err => reject(err));
        });
    }

    // This will be use to persist the information about the tracking status
    // The store is responsible to persist it in a database or localstorage
    updateTrackingsStatus(trackings) {
        this.Store.updateTrackingsStatus(trackings);
    }

    // Retrieves tracking for an specific url, that haven't been evaluated yet
    getTrackingsNotEvaluated(url) {
        return this.trackings.filter(t => !t.evaluated && t.url === url);
    }

    // Retrievs trackings which status has changed
    getChangedTrackings() {
        return this.trackings
            .filter(t => t.lastScanStatus === TrackingStatus.CHANGED ||
                t.lastScanStatus === TrackingStatus.CHANGED);
    }

    // Retrieves the currentTracking being evaluated and jump to the next one
    * trackingsGenerator() {
        while (this.trackingIndex < this.trackings.length) {
            yield this.trackings[this.trackingIndex];
            this.trackingIndex++;
        }
    }
}

export default TrackingActivity;
