'use strict';

import mongoose from 'mongoose';
import express from 'express';
import s3Handler from '../core/s3';
import ServerTrackingRunner from '../../../common/build/serverTrackingRunner.js';
import userModel from '../../../common/build/models/user.js';
import trackingModel from '../../../common/build/models/tracking.js';
import ServerStore from '../../../common/build/serverStore.js';

const router = express.Router();
const s3 = new s3Handler();
const User = userModel(mongoose);
const Tracking = trackingModel(mongoose);

router.get('/', (req, res) => {
    Tracking.find({
        isDeleted: false
    }, (err, trackings) => {
        if (err) {
            process.console.error('Error finding trackings, description: ' + err);
            res.status(500).send('Error finding trackings: ' + err);
        }
        res.send(trackings);
    });
});

router.post('/', (req, res) => {
    let trackingPayload = req.body.trackingPayload;
    let trackings = trackingPayload.trackings;
    if (!trackingPayload) {
        process.console.error('trackingPayload is required');
        res.status(500).send('trackingPayload is required');
    } else if (!trackingPayload.email) {
        process.console.error('trackingPayload.email is required');
        res.status(500).send('trackingPayload.email is required');
    } else if (!trackings || !Array.isArray(trackings) || !trackings.length) {
        process.console.error('trackingPayload.trackings is required');
        res.status(500).send('trackingPayload.trackings is required');
    } else {
        //First get the user
        User.findOne({
            email: trackingPayload.email
        }, (err, user) => {
            if (err || !user) {
                process.console.error('Error finding the user:' + trackingPayload.email + ' description: ' + err);
                res.status(500).send(`Error finding the user ${err}`);
            } else {
                trackings.forEach(tracking => {
                    tracking.user = user;
                    tracking.checkFrequency = user.trackingTime;
                    let trackingToSave = new Tracking(tracking);
                    trackingToSave.save((trackingErr, saved) => {
                        if (trackingErr) {
                            process.console.error('Error saving the trackings,' + ' description: ' + err);
                            res.status(500).send(`Error saving the trackings: ${trackingErr}`);
                        }
                    });
                });
            }
        });
        //TODO: Possible bug: I don't think this is happening after saving all trackings on line 44.
        res.send(`Trackings saved`);
    }
});

router.delete('/', (req, res) => {
    let id = req.body.id;
    if (!id) {
        process.console.error('TrackingID Required');
        res.status(500).send('TrackingID Required');
    } else {
        Tracking.findOne({
            '_id': id
        }, (err, t) => {
            if (err) {
                process.console.error('Error finding Tracking, trackingID:' + id + ' description: ' + err);
                res.status(500).send(err);
            } else {
                t.isDeleted = true;
                t.save((trackingErr, deleted) => {
                    if (trackingErr) {
                        process.console.error(`Error deleting the tracking: ${trackingErr}`);
                        res.status(500).send(`Error deleting the tracking: ${trackingErr}`);
                    } else {
                        res.status(200).send(deleted);
                    }
                });
            }
        });
    }
});

router.put('/enableDisable', (req, res) => {
    var id = req.body.id;
    var isEnabled = req.body.isEnabled;
    if (!id) {
        process.console.error('Error finding Tracking');
        res.status(500).send('TrackingID Required');
    } else {
        Tracking.findByIdAndUpdate(id, {
            $set: {
                isEnabled: isEnabled
            }
        }, function(err, tracking) {
            if (err) {
                process.console.error(`Error saving the tracking: ${err}`);
                res.status(500).send(`Error saving the tracking: ${err}`);
            } else {
                res.send(tracking);
            }
        });
    }
});

router.post('/image', (req, res) => {
    let image = req.body && req.body.image;

    if (!image) {
        process.console.error('Image is required');
        res.status(500).send('Image is required');
    } else {
        s3.postImage(image)
            .then(img => res.status(200).send(img.Location))
            .catch(err => {
                process.console.error('Error saving the image : ' + err.stack);
                res.status(500).send('Error saving the image : ' + err.stack);
            });
    }
});

router.put('/statusupdate', (req, res) => {
    var userEmail = req.body.email;
    var tracking = req.body.tracking;
    if (!userEmail) {
        process.console.error('User Email Required');
        res.status(500).send('User Email Required');
    } else if (!tracking) {
        process.console.error('Tracking Required');
        res.status(500).send('Tracking Required');
    } else {
        Tracking.findOne({
            '_id': tracking._id
        }, (err, t) => {
            if (err) {
                process.console.error('Error finding Tracking, trackingID:' + tracking._id);
                res.status(500).send(err);
            } else {
                t.lastScanStatus = tracking.lastScanStatus;
                t.lastScanDate = tracking.lastScanDate;
                t.save((trackingErr, saved) => {
                    if (trackingErr) {
                        process.console.error(`Error saving the tracking: ${trackingErr}`);
                        res.status(500).send(`Error saving the tracking: ${trackingErr}`);
                    } else {
                        res.status(200).send(saved);
                    }
                });
            }
        });
    }
});

router.get('/run', (req, res) => {
    new ServerTrackingRunner(ServerStore(Tracking))
        .run()
        .then(update => res.status(200).send(update))
        .catch(err => {
            process.console.error('Error ServerTrackingRunner, description: ' + err.stack);
            res.status(500).send(err.stack)
        })
});

export default router;
