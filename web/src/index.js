'use strict';

import config from '../config';
process.env.NODE_ENV = config.NODE_ENV;

import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import exphbs from 'express-handlebars';
import mongoose from 'mongoose';

//Routes
import usersRoutes from './routes/users';
import trackingsRoutes from './routes/trackings';
import errorRoutes from './routes/errors';

let dbReconnectionRetryTime = 1000;
mongoose.connect(config.dbConnectionString);
var db = mongoose.connection;

db.on('error', (err) => {
  console.log(err);
  // hack the driver to allow re-opening after initial network error
  db.db.close();

  setTimeout(() => {
    console.log('Retrying to connect.');
    mongoose.connect(config.dbConnectionString);
    dbReconnectionRetryTime += dbReconnectionRetryTime;
  }, dbReconnectionRetryTime);});

db.once('open', function() {
  console.log('db is up and running.');
});

const app = express();

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

app.get('/', (req, res) => res.render('home'));
app.use('/users', usersRoutes);
app.use('/trackings', trackingsRoutes);

//If we got here, we couldn't find the route
app.use((req, res, next) => {
  const err = {
    statusCode: 404,
    error: 'We couldn\'t find the page..',
    body: 'Sorry, but the page you are looking for was either not found or does not exist.'
  };

  req.url = '/errors';
  req.body.err = err;
  next();
});

//Global error handler
app.use((err, req, res, next) => {
  req.url = '/errors';
  next();
});

app.use('/errors', errorRoutes);

app.listen(config.PORT, () => {
  console.log(`Server is listening on port ${config.PORT} and the env is: ${process.env.NODE_ENV}`);
});
