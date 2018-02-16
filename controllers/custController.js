var Cust = require('../models/cust');
var Res = require('../models/reservations');

var async = require('async');

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
            Res.find({'creator': req.params.id})
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
        res.render('customer_detail', {title: 'Customer Detail', customer: results.customer, reservations: results.reservations});
    });
};

// Display Author create form on GET.
exports.customer_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Customer create GET');
};

// Handle Author create on POST.
exports.customer_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Customer create POST');
};

// Display Author delete form on GET.
exports.customer_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Customer delete GET');
};

// Handle Author delete on POST.
exports.customer_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Customer delete POST');
};
