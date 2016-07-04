'use strict';

import mongoose from 'mongoose';
import express from 'express';
import userModel from '../../../common/build/models/user.js';
import trackingModel from '../../../common/build/models/tracking.js';

const router = express.Router();
const User = userModel(mongoose);
const Tracking = trackingModel(mongoose);

router.get('/', (req, res) => {
    User.find({}, function(err, saved) {
        if (err) {
            process.console.error('Error finding the users, ' + ' description: ' + err);
            res.status(500).send('Error finding the users: ' + err);
        }
        res.send(saved);
    });
});

router.post('/', (req, res) => {
    let user = new User({
        email: req.body.email,
        trackingTime: req.body.trackingTime
    });
    if (!user.email || !user.trackingTime) {
        process.console.error('email and trackingTime is required');
        res.status(500).send('email and trackingTime is required');
    } else {
        User.findOne({
            email: user.email
        }, (err, userToFind) => {
            if (err) {
                process.console.error('Error finding the user:' + user.email + ' description: ' + err);
                res.status(500).send('Error finding the user: ' + err);
            }

            if (!userToFind) {
                let userToSave = new User(user);
                userToSave.save((err) => {
                    if (err) {
                        process.console.error('Error saving the user:' + userToSave + ' description: ' + err);
                        res.status(500).send('Error saving the user: ' + err);
                    } else {
                        res.send(user.email);
                    }
                });
            } else {
                User.update({
                    email: user.email
                }, {
                    trackingTime: user.trackingTime
                }, (err, userUpdated) => {
                    if (err) {
                        process.console.error('Error updating the user:' + user.email + ' description: ' + err);
                        res.status(500).send('Error updating the user: ' + err);
                    } else {
                        if (userToFind.trackingTime !== parseInt(req.body.trackingTime)) {
                            Tracking.update({
                                user: userToFind._id,
                                isDeleted: false
                            }, {
                                checkFrequency: user.trackingTime
                            }, {
                                multi: true
                            }, (err, updatedTrackings) => {
                                if (err) {
                                    process.console.error('Error updating the user\'s trackings,' + ' description: ' + err);
                                    res.status(500).send('Error updating the user\'s trackings: ' + err);
                                } else {
                                    res.send(userUpdated);
                                }
                            });
                        } else {
                            res.send(userUpdated);
                        }
                    }
                });
            }
        });
    }
});

router.get('/:email', (req, res) => {
    if (!req.params.email) {
        process.console.error('Required email');
        res.send(500, 'Required email');
    } else {
        User.findOne({
            email: req.params.email
        }, (err, user) => {
            if (err || !user) {
                process.console.error('Error finding the user:' + req.params.email + " description: " + err);
                res.status(500).send('Error finding the user: ' + err);
            } else {
                Tracking.find({
                    user: user._id,
                    isDeleted: false
                }, (err, trackings) => {
                    if (err) {
                        process.console.error('Error finding the trackings, userId:' + user._id + ' description: ' + err);
                        res.status(500).send('Error finding the trackings: ' + err);
                    }
                    res.send({
                        name: user.name,
                        email: user.email,
                        trackingTime: user.trackingTime,
                        trackings: trackings
                    });
                });
            }
        });
    }
});

export default router;
