'use strict';

import TrackingActivity from './trackingActivity';
import ServerTracker from './serverTracker';

const MINIMUNSPANTIME = 60;
const AVOIDOVERLAPPINGSPANTIME = 15;

class ServerTrackingRunner {
    constructor(store) {
        this.store = store;
    }

    run() {
        return new Promise((resolve, reject) =>
            this.trackingsToEvaluate()
            .then(trackings => {
                if (!trackings || trackings.length === 0) {
                    resolve([]);
                } else {
                    new TrackingActivity(trackings, this.store, ServerTracker)
                        .run().then(resolve).catch(reject);
                }
            }).catch(err => {
                console.log(err);
                reject(err);
            })
        );
    }

    trackingsToEvaluate() {
        return new Promise((resolve, reject) =>
            this.store.Tracking.find({
                $where: function() {
                    if (this.isDeleted || !this.isEnabled) return false;

                    var diff = ((new Date()).getTime() - this.lastScanDate.getTime()) / 60000; //difference in minutes

                    return diff >= MINIMUNSPANTIME && diff >= (this.checkFrequency + AVOIDOVERLAPPINGSPANTIME);
                }
            }, (err, trackings) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(trackings)
                }
            })
        );
    }
}

export default ServerTrackingRunner;
