'use strict';

import Store from './store';
import TrackingActivity from '../../../../common/build/trackingActivity';
import ClientTracker from '../../../../common/build/clientTracker';

const TrackingRunner = {
    run() {
        return new Promise((resolve, reject) =>
            Store.LoadUserSettings(config =>
                new TrackingActivity(config.trackings, Store, ClientTracker)
                .run()
                .then(resolve)
                .catch(reject)
            ));
    }
};

export default TrackingRunner;
