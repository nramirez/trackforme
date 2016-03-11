import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import exphbs from 'express-handlebars';
import mongoose from 'mongoose';

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

app.use('/', express.static(__dirname + '/public'));

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.listen(PORT, () => {
  console.log('Server is listening on port: ', PORT);
});

//routes
//TODO: Routing should be on sepate routes
//this is just a temporary change just to verify mongo functionalities
import User from './models/user.js';
import Site from './models/site.js';

app.get('/', (req, res) => {
  res.render('home');
});

app.post('/site', (req, res) => {
  let toSave = req.body.site;
  console.log(toSave);
  if (toSave) {
    //First get the user
    User.findOne({
      email: toSave.email
    }, (err, user) => {
      if (err || !user) res.send('Error finding the user ' + err);
      else {
        toSave.user = user;
        let site = new Site(toSave);
        site.save((siteErr, saved) => {
          if (siteErr) {
            console.log(siteErr);
          }
          res.send(saved);
        });
      }
    });
  } else {
    res.send('Site is required');
  }
});

app.get('/sites', (req, res) => {
  Site.find({}, function(err, sites) {
    if (err) console.log(err);
    res.send(sites);
  });
});

app.post('/user', (req, res) => {
  var toSave = req.body.user;
  if (toSave) {
    var user = new User(toSave);
    user.save((err) => {
      if (err) {
        console.log(err);
      }
      res.send(user);
    });
  } else {
    res.send('User is required');
  }
});

app.get('/users', (req, res) => {
  User.find({}, function(err, saved) {
    if (err) console.log(err);
    res.send(saved);
  });
});

app.get('/userinfo/:email', (req, res) => {
  if (!req.params.email) {
    res.send('Required email');
  } else {
    User.findOne({
      email: req.params.email
    }, (err, user) => {
      if (err || !user) res.send('Error finding the user ' + err);
      else {
        Site.find({
          user: user._id
        }, (err, sites) => {
          if (err) res.send('Error finding the sites ' + err);
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
