const path = require('path')
const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser')
const compression = require('compression')

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

app.use(express.static(path.resolve('./public')));

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// 1️⃣ GLOBAL MIDDLEWARES -------------------------------------------------------------------------------------------------------

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Allow control access origin
const corsConf = { origin: process.env.FRONT_HOST, credentials: true }
app.use(cors(corsConf))
app.options('*',cors(corsConf))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONT_HOST);
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
// app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log('💯 : ', req.cookies);
  next();
});

// Compress the data sended
app.use(compression())

// 3️⃣ ROUTES ------------------------------------------------------------------------------------------------------------------- 

// 🥇 TEMPLATE ROUTES
app.get('/', (req,res) => res.status(200).render('base'))

// 🥈 API ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
