
import { CronJob } from 'cron';
import ServerTrackingRunner from '../../../common/build/serverTrackingRunner.js';

/*
 * runs every hour (at 0 minutes and 0 seconds)
 */
var trackingJob = new CronJob('0 0 * * * *', function() {
  new ServerTrackingRunner(ServerStore(Tracking))
        .run()
        .then(update => res.status(200).send(update))
        .catch(err => {
            logger.error('Error ServerTrackingRunner, description: ' + err.stack);
            res.status(500).send(err.stack)
        });

  }, function () {
    /* This function is executed when the job stops */

  },
  true /* Start the job right now */
);
