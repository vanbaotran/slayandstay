require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');


const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

// const bcrypt = require('bcryptjs');
// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash')
const app = express();

require('./configs/session.config')(app);

mongoose
  .connect('mongodb://localhost/project2', {useNewUrlParser: true, useUnifiedTopology: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

app.use(flash());

app.use(
  session({
      secret: process.env.SESS_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 3600000*24*14 },
      store: new MongoStore({
          mongooseConnection: mongoose.connection,
      })
  })
);

 
// ...
 


// ...

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));


// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';



const index = require('./routes/index');
app.use('/', index);

const productRouter = require('./routes/product.routes');
app.use('/products', productRouter);

const authRouter = require('./routes/auth.routes');
app.use('/', authRouter)

const orderRouter = require('./routes/order.routes');
app.use('/', orderRouter);

module.exports = app;
