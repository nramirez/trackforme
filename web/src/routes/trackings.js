'use strict';

import User from '../models/user.js';
import Tracking from '../models/tracking.js';
import TrackingActivity from '../core/trackingActivity.js';
import express from 'express';
import s3Handler from '../core/s3';

const router = express.Router();
const s3 = new s3Handler();

router.get('/', (req, res) => {
    Tracking.find({}, (err, trackings) => {
        if (err) res.status(500).send('Error finding trackings: ' + err);
        res.send(trackings);
    });
});

router.post('/', (req, res) => {
    let trackingPayload = req.body.trackingPayload;
    if (!trackingPayload) {
        res.status(500).send('trackingPayload is required');
    } else if (!trackingPayload.email) {
        res.status(500).send('trackingPayload.email is required');
    } else if (!trackingPayload.trackings) {
        res.status(500).send('trackingPayload.trackings is required');
    } else {
        //First get the user
        User.findOne({
            email: trackingPayload.email
        }, (err, user) => {
            if (err || !user) {
                res.status(500).send(`Error finding the user ${err}`);
            } else {
                let trackings = trackingPayload.trackings;
                let keys = Object.keys(trackings);
                keys.forEach(k => {
                    let tracking = trackings[k];
                    tracking.user = user;
                    tracking.checkFrequency = user.trackingTime;
                    tracking = new Tracking(tracking);
                    tracking.save((trackingErr, saved) => {
                        if (trackingErr)
                            res.status(500).send(`Error saving the trackings: ${trackingErr}`);
                    });
                });
            }
        });
        res.send(`Trackings saved`);
    }
});

router.post('/image', (req, res) => {
    let image = req.body && req.body.image;

    if (!image) {
        res.status(500).send('Image is required');
    } else {
        s3.postImage(image)
            .then((img) => res.status(200).send(img.Location))
            .catch((err) => res.status(500).send('Internal error: ' + err.stack));
    }
});

router.get('/run', (req, res) => {
    let activity = new TrackingActivity();
    activity.run()
        .then(r => res.send(r))
        .catch(e => res.status(500).send(e.stack || e));
});

export default router;
