var Cust = require('../models/cust');
var Reservation = require('../models/reservations');
var Rest = require('../models/rest');

var async = require('async');
/*
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
};*/

exports.index = function(req, res){
    if(req.session.user){
        if(req.session.user.first_name){
            res.redirect('/users/cust/' + req.session.user._id);
        }
        else{
            res.redirect('/users/rest/' + req.session.user._id);
        }
    }
    else{
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
    }
}