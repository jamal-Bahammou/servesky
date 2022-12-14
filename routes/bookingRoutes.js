const express = require('express')
const bookingController = require('../controllers/bookingController')
const authController = require('../controllers/authController')

const router = express.Router()

router.use(authController.protect)
// router.use(authController.restrictTo('admin', 'lead-guide'))

router.get('/checkout-session-status/:sessionId', bookingController.getCheckoutSessionStatus)
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession)

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking)

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking)

module.exports = router