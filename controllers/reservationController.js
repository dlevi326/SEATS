const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var Rest = require('../models/rest');
var Cust = require('../models/cust');
var Res = require('../models/reservations');
var async = require('async');
var moment = require('moment');

// Display list of all Reservations.
exports.reservation_list = function(req, res, next) {
	Res.find().populate('creator rest')
		.exec(function(err, list_res){
			if(err){return next(err);}
			// Success
			res.render('res_list',{title: 'Reservation lists', res_list: list_res});
		});
};

// Display detail page for a specific Reservation.
exports.reservation_detail = function(req, res, next) {
    async.parallel({
        reservation: function(callback){
        	Res.findById(req.params.id).populate('creator').populate('rest').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if(results.reservation.creator._id == req.session.user._id)
            return res.render('res_detail', { title: 'Reservation Info', error: 'errors', reservation: results.reservation });
        if(results.reservation.rest._id == req.session.user._id)
            return res.render('res_detail', { title: 'Reservation Info', error: 'errors', reservation: results.reservation });
        return res.render('auth_err');
    });
};

// Display Reservation create form on GET.
exports.reservation_create_get = function(req, res, next) {
	//res.render('res_create', {title: 'Create Reservation', error: 'errors'})

	async.parallel({
        restaurants: function(callback) {
            Rest.find(callback);
        },
        customers: function(callback) {
            Cust.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('res_create', { title: 'Create Reservation',restaurants:results.restaurants, error: 'errors', customers: results.customers });
    });
};

// Handle Reservation create on POST.
exports.reservation_create_post = [
    // Validate fields.
    //body('restaurant').isLength({ min: 1 }).trim().withMessage('Restaurant should be specified.'),
    body('date').isLength({ min: 1}).trim().withMessage('Date must be specified.'),
    body('time').isLength({ min: 1 }).trim().withMessage('Time must be specified.'),
    body('people_num').isLength({ min: 1 }).trim().withMessage('People number must be specified.'),
    //body('creator').isLength({ min: 1 }).trim().withMessage('Creator must be specified.'),
    
    // Sanitize fields.
    //sanitizeBody('restaurant').trim().escape(),
    sanitizeBody('date').trim().escape(),
    sanitizeBody('time').trim().escape(),
    sanitizeBody('people_num').trim().escape(),
    //sanitizeBody('creator').trim().escape(),
    

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('res_create', { title: 'Create Reservations', errors: errors.array(), restaurants:res.restaurants,customers:res.customers });
            
        }
        else {
            // Data from form is valid.
            if(req.session.user.first_name){
                var rest_name = req.body.restaurant;
                var cust = req.session.user.email;
            }else{
                var rest_name = req.session.user.rest_name;
                var cust = req.body.creator;
            }
            if(req.body.rest_name==null){
                res_filters = null
                return res.render('res_create',{title:'Create Reservations',restaurants:res.restaurants, customers:res.customers, filtered_res:res_filters});
            }
            console.log(rest_name);
            console.log(cust);
            // Mongoose queries
            Rest.findOne({'rest_name':rest_name},'_id', function(err, restaurant){
                var error = [];
                if(err) return next(err)
                if(restaurant == null){
                    
                    async.parallel({
                        restaurants: function(callback) {
                            Rest.find(callback);
                        },
                        customers: function(callback) {
                            Cust.find(callback);
                        },
                    }, function(err, results) {
                        if (err) { return next(err); }
                            
                            error.push('Invalid restaurant');
                            findPerson(restaurant,error)
                    });
                }else{
                    checkTimeWithRest(restaurant,error);
                    
                }
            });


            checkTimeWithRest = function(restaurant,error){


                Rest.find({'rest_name':rest_name},'_id open_time close_time people_num max_capacity').exec(function(err, restaurants){
                    if(err){return next(err);}
                    if(restaurants==null){
                        console.log('Error, no restaurants found');
                        res.render('customer_detail', {title: 'Error: No restaurants found.  Customer Detail:', customer: results.customer, reservations: results.reservations});
                    }
                    Res.find({'rest':restaurants},'people_num date creator max_capacity').populate('creator rest').exec(function(err, reservations){
                        if(err){return next(err);}
                        if(reservations==null){
                            console.log('Error, no reservations found');
                            return res.render('rest_detail', {title: 'Error: No reservations found.  Restaurant Details:', Restaurant: results.rest, reservations: results.reservations});
                        }
                        // Error checking reservation time
                        var currDate = new Date();
                        var resDate = new Date(req.body.date + " " + req.body.time);
                        console.log(resDate);

                        // Error check but allow multiple reservations per time slot
                        // Chris Implementation
                        console.log(restaurants[0]);
                        var currCapacity = restaurants[0].max_capacity
                        console.log(currCapacity);

                        if (resDate < currDate || resDate > moment(currDate).add(3, 'M').toDate()) {
                        	console.log('ERROR: Time Collision.  Invalid Time: Time set before current date or after 3 months');
							return res.render('res_list',{title: 'ERROR: Time Collision.  Invalid Time: Time set before current date or after 3 months', res_list: reservations}); 
                        }


                        if((currCapacity-req.body.people_num)<0){
                            console.log('ERROR: Time Collision.  Conflicts with other reservations and restaurant is over capacity.');
							return res.render('res_list',{title: 'Error: Over Capacity.  Reservations for requested restaurant are listed below:', res_list: reservations});                                              
                        }
                        // End Implementation
                        for (var reserve of reservations){
                            var oldDateObj = reserve.date;
                            var newDateObj = moment(reserve.date).add(2, 'h').toDate();
                            if(newDateObj>=resDate&&resDate>=oldDateObj){
                                currCapacity-=reserve.people_num
                                if((currCapacity-req.body.people_num)<0){
                                    console.log('ERROR: Time Collision.  Conflicts with other reservations and restaurant is over capacity.');
                                    console.log(oldDateObj+' '+resDate+' '+newDateObj);
                                    console.log(currCapacity); 
                                    return res.render('res_list',{title: 'Error: Time collision.  Reservations for requested restaurant are listed below:', res_list: reservations});
                                }    
                            }  
                        }
                        
                        var open = restaurants[0].open_time.getHours()+':'+restaurants[0].open_time.getMinutes();
                        var close = restaurants[0].close_time.getHours()+':'+restaurants[0].close_time.getMinutes();
                        var resTime = resDate.getHours()+':'+resDate.getMinutes();
                        var newDateObj1 = moment(resDate).add(2, 'h').toDate();
                        var newResTime = newDateObj1.getHours()+':'+newDateObj1.getMinutes();

                        if(resTime<open&&resTime>close){
                            console.log('ERROR: Restaurant is not open at requested time');
                            console.log(open+ ' '+resTime+' '+close);
                            return res.render('res_list',{title: 'Error: Time collision.  Restaurant is not open at requested time.  Reservations for requested restaurant are listed below', res_list: reservations});
                        }
                        else if(newResTime>close){
                            console.log('ERROR: Reservation cannot go past close time');
                            console.log(open);
                            console.log(close);
                            console.log(newResTime);
                            console.log(resDate);
                            return res.render('res_list',{title: 'Error: Time collision.  Time is out of bounds for restaurant.  Reservations for requested restaurant are listed below', res_list: reservations});
                        }
                        else{
                            findPerson(restaurant,error);
                        }

                    });
                });

            }

            findPerson = function(restaurant,error){
                Cust.findOne({'email':cust},'_id', function(err, person){
                    if(err) return next(err)
                    if(person == null){

                        async.parallel({
                            restaurants: function(callback) {
                                Rest.find(callback);
                            },
                            customers: function(callback) {
                                Cust.find(callback);
                            },
                        }, function(err, results) {
                            if (err) { return next(err); }
                                error.push('Invalid Customer Email')
                                res.render('res_create', { title: 'Create Reservation',restaurants:results.restaurants, errors: error, customers: results.customers });
                        });
                    }
                    else {
                        saveSchema(restaurant,person)
                    }
                });
            }
            
            saveSchema = function(restaurant,person){
                var reservation = new Res({
                    creator: person._id,
                    date: new Date(req.body.date + " " + req.body.time),
                    people_num: req.body.people_num,
                    rest: restaurant._id,
                });
                saveRes(reservation)
            }
        
            saveRes = function(reservation){
                reservation.save(function(err){
                    if(err){return next(err);}
                    res.redirect(reservation.url)
                })
            }
        }
    }
];

// Display Reservation delete form on GET.
exports.reservation_delete_get = function(req, res) {
    async.parallel({
        reservation: function(callback) {
          Res.findById(req.params.id).populate('creator').exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.reservation==null) { // No results.
            res.redirect('/');
        }
        // Successful, so render.
        res.render('res_delete', { title: 'Delete Reservation', reservation: results.reservation } );
    });
};

// Handle Reservation delete on POST.
exports.reservation_delete_post = function(req, res) {
    //res.send('NOT IMPLEMENTED: Reservation delete POST');
    async.parallel({
        reservation: function(callback) {
          Res.findById(req.body.id).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        
        // No results.
        Res.findByIdAndRemove(req.body.resid, function deleteReservation(err) {
            if (err) { return next(err); }
            // Success - go to Reservation list
            console.log(req.body.resid + " deleted")
            res.redirect('/')
        })
    });
};
