var Cust = require('../models/cust');
var Reservation = require('../models/reservations');
var Rest = require('../models/rest');


var async = require('async');

exports.index = function(req, res) {   
    
    async.parallel({
        cust_count: function(callback) {
            Cust.count(callback);
        },
        res_count: function(callback) {
            Reservation.count(callback);
        },
        rest_count: function(callback) {
            Rest.count(callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'SEATS', error: err, data: results });
    });
};