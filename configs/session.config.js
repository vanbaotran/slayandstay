  
// require session
const session = require('express-session');
 
// ADDED: require mongostore
const MongoStore = require('connect-mongo')(session);
 
// ADDED: require mongoose
const mongoose = require('mongoose');
 
module.exports = app => {
  app.use(
    session({
      secret: process.env.SESS_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 60 * 60 * 24 * 14 * 60},
      store: new MongoStore({
        // <== ADDED !!!
        mongooseConnection: mongoose.connection,
        // ttl => time to live
        ttl: 60 * 60 * 24 * 14 * 60// 60sec * 60min * 24h => 1 day
      })
    })
  );
};