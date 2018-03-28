const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var Rest = require('../models/rest');
var Cust = require('../models/cust');
var Res = require('../models/reservations');
var async = require('async');
var moment = require('moment');

// Display list of all Authors.
exports.reservation_list = function(req, res, next) {
	Res.find().populate('creator rest')
		.exec(function(err, list_res){
			if(err){return next(err);}
			// Success
			res.render('res_list',{title: 'Reservation lists', res_list: list_res});
		});
};

// Display detail page for a specific Author.
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

// Display Author create form on GET.
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

// Handle Author create on POST.
exports.reservation_create_post = [
    // Validate fields.
    body('restaurant').isLength({ min: 1 }).trim().withMessage('Restaurant should be specified.'),
    body('date').isLength({ min: 1}).trim().withMessage('Date must be specified.'),
    body('time').isLength({ min: 1 }).trim().withMessage('Time must be specified.'),
    body('people_num').isLength({ min: 1 }).trim().withMessage('People number must be specified.'),
    body('creator').isLength({ min: 1 }).trim().withMessage('Creator must be specified.'),
    // Sanitize fields.
    sanitizeBody('restaurant').trim().escape(),
    sanitizeBody('date').trim().escape(),
    sanitizeBody('time').trim().escape(),
    sanitizeBody('people_num').trim().escape(),
    sanitizeBody('creator').trim().escape(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('res_create', { title: 'Create Reservations', errors: errors.array(), restaurants:res.restaurants,customers:res.customers });
            return;
        }
        else {
            // Data from form is valid.

            // Mongoose queries
            Rest.findOne({'rest_name':req.body.restaurant},'_id', function(err, restaurant){
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

                Rest.find({'rest_name':req.body.restaurant},'_id open_time close_time max_capacity').exec(function(err, restaurants){
                    if(err){return next(err);}
                    if(restaurants==null){
                        console.log('Error, no restaurants found');
                        return
                    }
                    Res.find({'rest':restaurants},'people_num date creator').populate('creator').exec(function(err, reservations){
                        if(err){return next(err);}
                        if(reservations==null){
                            console.log('Error, no reservations found');
                            return 
                        }
                        // Error checking reservation time

                        var resDate = new Date(req.body.date + " " + req.body.time);
                        console.log(resDate);

                        // Error check but allow multiple reservations per time slot

                        var currCapacity = restaurants[0].max_capacity

                        for (var reserve of reservations){
                            var oldDateObj = reserve.date;
                            var newDateObj = moment(reserve.date).add(2, 'h').toDate();
                            if(newDateObj>=resDate&&resDate>=oldDateObj){
                                currCapacity-=reserve.people_num
                                if((currCapacity-req.body.people_num)<0){
                                    console.log('ERROR: Time Collision');
                                    console.log(oldDateObj+' '+resDate+' '+newDateObj);
                                    console.log(currCapacity);
                                    
                                    res.render('res_list',{title: 'Error: Time collision.  Reservations for requested restaurant are listed below', res_list: reservations});
                                    return;
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
                            return;
                            
                        }
                        else if(newResTime>close){
                            console.log('ERROR: Reservation cannot go past close time');
                            console.log(open);
                            console.log(close);
                            console.log(newResTime);
                            console.log(resDate);
                            res.render('res_list',{title: 'Error: Time collision.  Time is out of bounds for restaurant.  Reservations for requested restaurant are listed below', res_list: reservations});
                            return;
                        }
                        else{
                            findPerson(restaurant,error);
                        }

                    });
                });

            }

            findPerson = function(restaurant,error){
                Cust.findOne({'email':req.body.creator},'_id', function(err, person){
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

// Display Author delete form on GET.
exports.reservation_delete_get = function(req, res) {
    async.parallel({
        reservation: function(callback) {
          Res.findById(req.params.id).populate('creator').exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.reservation==null) { // No results.
            res.redirect('/users/res');
        }
        // Successful, so render.
        res.render('res_delete', { title: 'Delete Reservation', reservation: results.reservation } );
    });
};

// Handle Author delete on POST.
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
            // Success - go to author list
            console.log(req.body.resid + " deleted")
            res.redirect('/users/reservation')
        })
    });
};






