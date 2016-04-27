'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import exphbs from 'express-handlebars';
import mongoose from 'mongoose';
import config from '../config';
import passport from 'passport';
//Routes
import usersRoutes from './routes/users';
import trackingsRoutes from './routes/trackings';
import errorRoutes from './routes/errors';

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
const PORT = process.env.PORT || 8000;

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
//todo: ES6
require('./passport.config')(passport, config);

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.render('home');
});

app.use('/users', usersRoutes);
app.use('/trackings', trackingsRoutes);

app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['email', 'profile']
    }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', successRedirect: '/'})
);

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

app.listen(PORT, () => {
    console.log('Server is listening on port: ', PORT);
});
