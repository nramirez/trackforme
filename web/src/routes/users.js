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
  let toSave = req.body.user;
  if (!toSave) {
    res.status(500).send('User is required');
  } else {
    let user = new User(toSave);
    user.save((err) => {
      if (err) {
        res.status(500).send('Error saving user: ' + err);
      }
      res.send(user);
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
            sites: sites
          });
        });
      }
    });
  }
});

export default router;
