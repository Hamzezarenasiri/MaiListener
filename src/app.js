const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const util = require('util');
const console = require('console');
const httpStatus = require('http-status');
const session = require('express-session');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
require('./middlewares/passport');
const { isLoggedIn } = require('./middlewares/passport');
const logger = require('./config/logger');
const { getGmailDetails } = require('./services/mail.service');

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

app.post('/webhook', async (req, res) => {
  try {
    const { messageId, data } = req.body;
    console.log(util.inspect(req.body, { showHidden: false, depth: null, colors: true }));
    console.log(util.inspect(req, { showHidden: false, depth: null, colors: true }));
    logger.info(`Received email with ID: ${messageId}`);
    // Fetch the email details using Gmail API
    const emailDetails = await getGmailDetails(data, messageId);
    logger.info('Email Details:', emailDetails);
    res.status(200).send('Webhook received');
  } catch (error) {
    logger.error(error);
  }
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
