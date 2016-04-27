'use strict';

import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  const err = req.body.err || {};

  const statusCode = err.statusCode || 500;
  const error = err.error || 'Oops... Internal server error.';
  const body = err.body || 'Sorry but something went really bad in our end.';

  res.status(statusCode);
  // respond with html
  if (req.accepts('html')) {
    res.render('error', {
      statusCode: statusCode,
      error: error,
      body: body
    });

    return;
  }

  // reply with json
  res.send({ error: err });
});

export default router;
