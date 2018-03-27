var express = require('express');
var router = express.Router();

// Require controller modules.
var cust_controller = require('../controllers/custController');
var reservation_controller = require('../controllers/reservationController');
var rest_controller = require('../controllers/restController');
var login_controller = require('../controllers/loginController');
var listing = require('../controllers/listing');


/// Customer ROUTES ///

// GET SEATS home page.
router.get('/', listing.index);

// Login Routes
router.get('/users/login',login_controller.login_get);

router.post('/users/login',login_controller.login_post);

router.get('/users/logout', login_controller.logout);

// GET request for creating a Customer. NOTE This must come before routes that display Book (uses id).
router.get('/users/cust/create', cust_controller.customer_create_get);

// POST request for creating a Customer.
router.post('/users/cust/create', cust_controller.customer_create_post);

// GET request to delete a Customer.
router.get('/users/cust/:id/delete', cust_controller.customer_delete_get);

// POST request to delete a Customer.
router.post('/users/cust/:id/delete', cust_controller.customer_delete_post);

// GET request for one Customer.
router.get('/users/cust/:id', cust_controller.customer_detail);

// GET request for list of all Customers.
router.get('/users/cust', cust_controller.customer_list);

/// Reservation ROUTES ///

// GET request for creating a Reservation.

router.get('/users/reservation/create', reservation_controller.reservation_create_get);

// POST request for creating a Reservation.
router.post('/users/reservation/create', reservation_controller.reservation_create_post);

// GET request to delete a Reservation.
router.get('/users/reservation/:id/delete', reservation_controller.reservation_delete_get);

// POST request to delete a Reservation.
router.post('/users/reservation/:id/delete', reservation_controller.reservation_delete_post);

// GET request for one Reservation.
router.get('/users/reservation/:id', reservation_controller.reservation_detail);

// GET request for list of all Reservations.
router.get('/users/reservation', reservation_controller.reservation_list);

/// Restaurant ROUTES ///

// GET request for creating a Restaurant.

router.get('/users/rest/create', rest_controller.rest_create_get);

// POST request for creating a Restaurant.
router.post('/users/rest/create', rest_controller.rest_create_post);

// GET request to delete a Restaurant.
router.get('/users/rest/:id/delete', rest_controller.rest_delete_get);

// POST request to delete a Restaurant.
router.post('/users/rest/:id/delete', rest_controller.rest_delete_post);

// GET request for one Restaurant.
router.get('/users/rest/:id', rest_controller.rest_detail);

// GET request for list of all Restaurant.
router.get('/users/rest', rest_controller.rest_list);




module.exports = router;
