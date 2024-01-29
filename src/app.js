const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const session = require('express-session');
const console = require('console');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
require('./middlewares/passport');
const { isLoggedIn } = require('./middlewares/passport');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// express session
app.use(
  session({
    secret: config.secret,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.session());

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// Base route
app.get('/', (req, res) => {
  res.send('Home Page');
});

// Success route if the authentication is successful
app.get('/success', isLoggedIn, (req, res) => {
  res.send(`Welcome ${req.user.displayName}`);
});

app.post('/webhook', (req, res) => {
  const data = req.body;
  console.log('Received notification:>>>>>>>>>>>>>', data, '<<<<<<<<<<<<<<<<<<<<<<<<<');
  res.status(200).send('OK');
});

// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
