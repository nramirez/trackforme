'use strict';

import User from '../models/user.js';
import Site from '../models/site.js';
import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    User.find({}, function(err, saved) {
        if (err) res.status(500).send('Error finding the users: ' + err);
        res.send(saved);
    });
});

router.post('/', (req, res) => {
    let user = new User({
        email: req.body.email,
        trackingTime: req.body.trackingTime
    });
    if (!user.email || !user.trackingTime) {
        res.status(500).send('email and trackingTime is required');
    } else {
        User.findOne({
            email: user.email
        }, (err, userToFind) => {
            if (err)
                res.status(500).send('Error finding the user: ' + err);

            if (!userToFind) {
                let userToSave = new User(user);
                userToSave.save((err) => {
                    if (err)
                        res.status(500).send('Error saving the user: ' + err);
                    else
                        res.send(user.email);
                });
            } else {
                User.update({
                    email: user.email
                }, {
                    trackingTime: user.trackingTime
                }, (err, userUpdated) => {
                    if (err)
                        res.status(500).send('Error updating the user: ' + err);
                    else
                        res.send(userUpdated);
                });
            }
        });
    }
});

router.get('/:email', (req, res) => {
    if (!req.params.email) {
        res.send(500, 'Required email');
    } else {
        User.findOne({
            email: req.params.email
        }, (err, user) => {
            if (err || !user) res.status(500).send('Error finding the user: ' + err);
            else {
                Site.find({
                    user: user._id
                }, (err, sites) => {
                    if (err) res.status(500).send('Error finding the sites: ' + err);
                    res.send({
                        name: user.name,
                        email: user.email,
                        trackingTime: user.trackingTime,
                        sites: sites
                    });
                });
            }
        });
    }
});

export default router;
