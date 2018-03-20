const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var Rest = require('../models/rest');
var Cust = require('../models/cust');
var Res = require('../models/reservations');
var async = require('async');

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
exports.rest_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Rest create POST');
};

// Display Author delete form on GET.
exports.rest_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Rest delete GET');
};

// Handle Author delete on POST.
exports.rest_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Rest delete POST');
};
