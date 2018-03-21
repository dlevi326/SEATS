const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var Rest = require('../models/rest');
var Cust = require('../models/cust');
var Res = require('../models/reservations');
var async = require('async');

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
        	Res.findById(req.params.id).populate('creator').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('res_detail', { title: 'Reservation Info', error: 'errors', reservation: results.reservation });
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
    body('time').isLength({ min: 1 }).trim().withMessage('Time must be specified.'),
    body('people_num').isLength({ min: 1 }).trim().withMessage('People number must be specified.'),
    body('creator').isLength({ min: 1 }).trim().withMessage('Creator must be specified.'),
    // Sanitize fields.
    sanitizeBody('restaurant').trim().escape(),
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
                if(err) return handleError('err');
                if(restaurant==null){
                    var errors = []
                    errors.push('Invalid restaurant')
                    res.render('res_create',{ title: 'Create Reservations', errors: errors, restaurants:res.restaurants,customers:res.customers })
                }
                findPerson(restaurant)
                
            });

            findPerson = function(restaurant){
                Cust.findOne({'email':req.body.email},'_id', function(err, person){
                    if(err) return handleError(err);
                    saveSchema(restaurant,person)
                });
            }
            
            saveSchema = function(restaurant,person){
                var reservation = new Res({
                    creator: person._id,
                    time: req.body.time,
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
    res.send('NOT IMPLEMENTED: Reservation delete GET');
};

// Handle Author delete on POST.
exports.reservation_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Reservation delete POST');
};
