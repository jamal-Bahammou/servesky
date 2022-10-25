const Tour = require('../models/tourModel')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')
const Booking = require('../models/bookingModel')

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

exports.getCheckoutSession = catchAsync(async(req,res,next) => {

    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId)
    
    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
            },
            unit_amount: tour.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONT_HOST}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONT_HOST}/tour/${tour.slug}`,
    });

    // 3) Create session as response
    res.status(200).json({
        status: 'success',
        type: "checkout.session.create",
        session
    });

})

exports.getCheckoutSessionStatus = catchAsync(async(req,res,next) => {

  const session = await stripe.checkout.sessions.retrieve(req.params.sessionId)

    res.status(200).json({
      status: 'success',
      type: "checkout.session.status",
      session
  });
})

exports.createBooking = factory.createOne(Booking)
exports.getBooking = factory.getOne(Booking)
exports.getAllBookings = factory.getAll(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)
