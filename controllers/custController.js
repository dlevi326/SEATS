const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var Cust = require('../models/cust');
var Res = require('../models/reservations');
var async = require('async');
var bcrypt = require('bcrypt');

const saltRounds = 10;

// Display list of all Authors.
exports.customer_list = function(req, res,next) {
    Cust.find({}, 'first_name last_name phone_number address')
    	.exec(function(err, list_cust){
    		if(err){return next(err);}
    		// Successful
    		res.render('cust_list',{title: 'Customer List', cust_list: list_cust});
    	});
};

// Display detail page for a specific Author.
exports.customer_detail = function(req, res, next) {
    async.parallel({
        customer: function(callback){
            Cust.findById(req.params.id)
                .exec(callback)
        },
        reservations: function(callback){
            Res.find({'creator': req.params.id}).populate('rest')
                .exec(callback)
        },
    },function(err,results){
        if(err){return next(err);}
        if(results.customer==null){
            var err = new Error('Customer not found');
            err.status = 404;
            return next(err);
        }
        // Successful
        if(req.session.user._id == results.customer._id)
            res.render('customer_detail', {title: 'Customer Detail', customer: results.customer, reservations: results.reservations});
        else
            res.render('auth_err')
    });
};

// Display Author create form on GET.
exports.customer_create_get = function(req, res) {
    res.render('cust_form', { title: 'Create Customer'});
};

exports.customer_create_post =  [
    // Validate fields.
    body('email').isLength({ min: 5 }).trim().withMessage('Email should be longer than five characters.')
        .isEmail().withMessage('Not a valid email address.'),
   	body('password').isLength({ min: 5 }).trim().withMessage('password should be longer than five characters.'),
   	//body('password2').equals(body('password')).withMessage('password does not match'),
    body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('last_name').isLength({ min: 1 }).trim().withMessage('Last name must be specified.')
        .isAlphanumeric().withMessage('Last name has non-alphanumeric characters.'),
    body('phone_number').isLength({ min: 1 }).trim().withMessage('Phone must be specified.'),
        //.isAlphanumeric().withMessage('Phone Number has non-alphanumeric characters.'),
    
    // Sanitize fields.
    sanitizeBody('email').trim().escape(),
    sanitizeBody('password').trim().escape(),
    sanitizeBody('password2').trim().escape(),
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('last_name').trim().escape(),
    sanitizeBody('phone_number').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('cust_form', { title: 'Create Customer', name: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Create an Author object with escaped and trimmed data.
            bcrypt.hash(req.body.password, saltRounds, function(err, hash){
                var cust = new Cust(
                    {
                    	email: req.body.email,
                    	password: hash,
                        first_name: req.body.first_name,
                        last_name: req.body.last_name,
                        phone_number: req.body.phone_number
                    });
                cust.save(function (err) {
                    if (err) { return next(err); }
                    // Successful - redirect to new author record.
                    res.redirect(cust.url);
                });
            });
        }
    }
];

exports.customer_delete_get = function(req, res, next) {
	async.parallel({
        customer: function(callback) {
          Cust.findById(req.params.id).exec(callback)
        },
        reservation: function(callback) {
          Res.find({'creator': req.params.id }).populate('rest creator').exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.reservation==null || req.params.id != req.session.user._id) { // No results.
            res.redirect('/users/cust');
        }
        // Successful, so render.
        res.render('cust_delete', { title: 'Delete Customer', customer: results.customer, reservations: results.reservation } );
    });
};

// Handle Author delete on POST.
exports.customer_delete_post = function(req, res) {
    async.parallel({
        customer: function(callback) {
          Cust.findById(req.body.id).exec(callback)
        },
        reservation: function(callback) {
          Res.find({'creator': req.body.id}).populate('creator').exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if(results.reservation.length > 0){
        	res.render('cust_delete', { title: 'Delete Customer', customer: results.customer, reservations: results.reservation } );
    		return;
        }else{
        	// No results.
            Cust.findByIdAndRemove(req.body.custid, function deleteCustomer(err) {
                if (err) { return next(err); }
                // Success - go to author list
                console.log(req.body.custid + " deleted")
                res.redirect('/users/cust')
            })
        }
    });
};


exports.customer_update_get = function(req,res, next){
    async.parallel({
        customer: function(callback) {
          Cust.findById(req.session.user._id).exec(callback)
        },
        reservation: function(callback) {
          Res.find({'creator': req.session.user._id }).populate('rest creator').exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Successful, so render.
        res.render('cust_update', { title: 'Update Customer', customer: results.customer, reservations: results.reservation } );
    });
}

exports.customer_update_post = function(req,res){
    res.send('Customer update post not implemented yet')
}