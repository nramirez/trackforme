import User from './models/user';
import { OAuth2Strategy } from 'passport-google-oauth';

module.exports = (passport, config) => {

    passport.use(new OAuth2Strategy({
        clientID: config.Google.GOOGLE_CLIENT_ID,
        clientSecret: config.Google.GOOGLE_CLIENT_SECRET,
        callbackURL: config.Google.GOOGLE_CALLBACK_URL
    }, (accessToken, refreshToken, profile, done) => {
        console.log('mangamo to', accessToken, refreshToken, profile)
        process.nextTick(() => {
            User.findOne({
                'google.id': profile.id
            }, (err, user) => {
                if (err) return done(err);
                if (user) {
                    console.log('existed')

                    return done(null, user);
                } else {
                    console.log('not existed')

                    var userToCreate = new User();
                    userToCreate.name = profile.displayname;
                    userToCreate.google = profile;

                    userToCreate.save((err, user) => {
                        if (err) return done(err);
                        else return done(null, user);
                    });

                }
            });
        });
    }));

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
}
