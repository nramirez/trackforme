'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import exphbs from 'express-handlebars';
import mongoose from 'mongoose';
import config from '../config';

//Routes
import usersRoutes from './routes/users';
import trackingsRoutes from './routes/trackings';

const localdb = 'mongodb://localhost:27017/trackforme';
const devdb = 'Please a backup db';
let dbReconnectionRetryTime = 1000;
let currentDb = localdb;

mongoose.connect(currentDb);

var db = mongoose.connection;
db.on('error', (err) => {
  console.log(err);
  // hack the driver to allow re-opening after initial network error
  db.db.close();

  setTimeout(() => {
    currentDb = currentDb === localdb ? devdb : localdb;
    console.log('Retrying to reconnect to: ', currentDb);
    mongoose.connect(currentDb);
    //Increment the retry, so we give some time for the endpoint recuperation.
    dbReconnectionRetryTime += dbReconnectionRetryTime;
  }, dbReconnectionRetryTime);
});

db.once('open', function() {
  console.log('db is up and running on', currentDb);
});

const app = express();
const PORT = 8000;

app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

app.use(morgan('dev'));
app.use(bodyParser.json({
  limit: config.maxScreenshotSize
}));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: config.maxScreenshotSize
}));

app.get('/', (req, res) => {
  res.render('home');
});

app.use('/users', usersRoutes);
app.use('/trackings', trackingsRoutes);

app.use((req, res, next) => {
  res.status(404);

  const statusCode = 404;
  const error = 'We couldn\'t find the page..';
  const body = 'Sorry, but the page you are looking for was either not found or does not exist.';

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
  res.send({ error: 'Not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const error = err.error || 'Oops... Internal server error.';
    const body = err.body || 'Sorry but something went really bad in our end.';

    res.status(err.status || statusCode).render(statusCode, {
      statusCode: statusCode,
      error: error,
      body: body
    });
});

app.listen(PORT, () => {
  console.log('Server is listening on port: ', PORT);
});
