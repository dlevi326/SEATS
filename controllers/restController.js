const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var Rest = require('../models/rest');
var Cust = require('../models/cust');
var Res = require('../models/reservations');
var async = require('async');
var bcrypt = require('bcrypt');

const saltRounds = 10;


// Display list of all Authors.
exports.rest_list = function(req, res) {
	Rest.find()
		.exec(function(err, list_rest){
			if(err){return next(err);}
			// Success
			res.render('rest_list',{title: 'Restaurant lists', rest_list: list_rest});
		});
};

// Display detail page for a specific Author.
exports.rest_detail = function(req, res, next) {
    //res.send('NOT IMPLEMENTED: Rest detail: ' + req.params.id);
     async.parallel({
        rest: function(callback){
            Rest.findById(req.params.id)
                .exec(callback)
        },
        reservations: function(callback){
            Res.find({'rest': req.params.id}).populate('creator')
                .exec(callback)
        },
    },function(err,results){
        if(err){return next(err);}
        if(results.rest==null){
            var err = new Error('Customer not found');
            err.status = 404;
            return next(err);
        }
        // Successful
        res.render('rest_detail', {title: 'Restaurant Details', Restaurant: results.rest, reservations: results.reservations});
    });
};

// Display Author create form on GET.
exports.rest_create_get = function(req, res) {
    //res.send('NOT IMPLEMENTED: Rest create GET');
	res.render('rest_create', {title: 'Create Restaurant', error: 'errors'})
};

// Handle Author create on POST.
exports.rest_create_post = [
    // Validate fields.
    body('email').isLength({ min: 5 }).trim().withMessage('Email should be longer than five characters.')
        .isEmail().withMessage('Not a valid email address.'),
    body('password').isLength({ min: 5 }).trim().withMessage('password should be longer than five characters.'),
    //body('password2').equals(body('password')).withMessage('password does not match'),
    body('rest_name').isLength({ min: 1 }).trim().withMessage('Restaurant name must be specified.'),

    body('Address').isLength({ min: 1 }).trim().withMessage('Address must be specified.'),

    body('max_capacity').isLength({ min: 1 }).trim().withMessage('Max capacity must be specified.'),

    body('phone_number').isLength({ min: 1 }).trim().withMessage('Phone number must be specified.'),
       
    body('open_time').isLength({ min: 1 }).trim().withMessage('Open time must be specified.'),

    body('close_time').isLength({ min: 1 }).trim().withMessage('Close time must be specified.'),
    
    // Sanitize fields.
    sanitizeBody('email').trim().escape(),
    sanitizeBody('password').trim().escape(),
    sanitizeBody('password2').trim().escape(),
    sanitizeBody('rest_name').trim().escape(),
    sanitizeBody('Address').trim().escape(),
    sanitizeBody('max_capacity').trim().escape(),
    sanitizeBody('phone_number').trim().escape(),
    sanitizeBody('open_time').trim().escape(),
    sanitizeBody('close_time').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('rest_create', { title: 'Create Customer', errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.
            var defaultdate = "1970-01-01"
            console.log(new Date(defaultdate + " " + req.body.open_time))
            console.log(new Date(defaultdate + " " + req.body.close_time))
            // Create an Author object with escaped and trimmed data.
            bcrypt.hash(req.body.password, saltRounds, function(err, hash){
                if(err) { return nex(err);}
                var rest = new Rest(
                {
                    email: req.body.email,
                    password: hash,
                    rest_name: req.body.rest_name,
                    max_capacity: req.body.max_capacity,
                    Address: req.body.Address,
                    phone_number: req.body.phone_number,
                    open_time: new Date(defaultdate + " " + req.body.open_time),
                    close_time: new Date(defaultdate + " " + req.body.close_time)
                    });
                rest.save(function (err) {
                    if (err) { return next(err); }
                    // Successful - redirect to new author record.
                    res.redirect(rest.url);
                });
            });
            
        }
    }
];

// Display Author delete form on GET.
exports.rest_delete_get = function(req, res,next) {
    async.parallel({
        rest: function(callback) {
          Rest.findById(req.params.id).exec(callback)
        },
        reservation: function(callback) {
          Res.find({'rest': req.params.id }).populate('rest creator').exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.reservation==null) { // No results.
            res.redirect('/users/rest');
        }
        // Successful, so render.
        res.render('rest_delete', { title: 'Delete Restaurant', rest: results.rest, reservations: results.reservation } );
    });
};

// Handle Author delete on POST.
exports.rest_delete_post = function(req, res) {
    async.parallel({
        rest: function(callback) {
          Rest.findById(req.body.id).exec(callback)
        },
        reservation: function(callback) {
          Res.find({'rest': req.body.id}).populate('rest').exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if(results.reservation.length > 0){
            res.render('rest_delete', { title: 'Delete Restaurant', rest: results.rest, reservations: results.reservation } );
            return;
        }else{
            // No results.
            Rest.findByIdAndRemove(req.body.restid, function deleteRest(err) {
                if (err) { return next(err); }
                // Success - go to author list
                console.log(req.body.restid + " deleted")
                res.redirect('/users/rest')
            })
        }
    });
};

exports.rest_update_get = function(req, res, next){
    res.render('rest_update', { title: 'Update Restaurant'} );
}

exports.rest_update_post = function(req, res){
    //implement password check
    //implement express validator
    var defaultdate = "1970-01-01";
    var otime = new Date(defaultdate + " " + req.body.open_time);
    var ctime = new Date(defaultdate + " " + req.body.close_time);
    Rest.findOneAndUpdate({'email': req.session.user.email}, {$set:{rest_name: req.body.rest_name, Address:req.body.Address, phone_number: req.body.phone_number, max_capacity: req.body.max_capacity, open_time: otime, close_time: ctime}}, {}, function(err, customer){
        if(err) {
            console.log(err);
            return next(err);
        }
        else{
            console.log(customer);
            res.redirect(customer.url);
        }
    });
}
