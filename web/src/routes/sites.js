'use strict';

import User from '../models/user.js';
import Site from '../models/site.js';
import express from 'express';
import s3Handler from '../core/s3';

const router = express.Router();
const s3 = new s3Handler();

router.get('/', (req, res) => {
  Site.find({}, function(err, sites) {
    if (err) res.status(500).send('Error finding sites: ' + err);
    res.send(sites);
  });
});

router.post('/', (req, res) => {
  let toSave = req.body.site;
  if (!toSave) {
    res.status(500).send('Site is required');
  } else {
    //First get the user
    User.findOne({
      email: toSave.email
    }, (err, user) => {
      if (err || !user) res.status(500).send('Error finding the user ' + err);
      else {
        toSave.user = user;
        let site = new Site(toSave);
        site.save((siteErr, saved) => {
          if (siteErr) {
            res.status(500).send('Error saving the sites: ' + siteErr);
          }
          res.send(saved);
        });
      }
    });
  }
});


router.post('/image', (req, res) => {
  let image = req.body.image;
  if (!image) {
    res.status(500).send('Image is required');
  }
  else {
    s3.postImage(image)
        .then((img) => {
          res.sendStatus(200);
        })
        .catch((err) => {
            res
              .status(500)
              .send('Internal error: ' + err.stack);
        });
  }
});

export default router;