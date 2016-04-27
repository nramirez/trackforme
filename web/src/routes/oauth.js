'use strict';

import User from '../models/user.js';
import express from 'express';

const router = express.Router();
const s3 = new s3Handler();

router.get('/google', (req, res) => {
    Tracking.find({}, (err, trackings) => {
        if (err) res.status(500).send('Error finding trackings: ' + err);
        res.send(trackings);
    });
});

export default router;
