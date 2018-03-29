const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var Rest = require('../models/rest');
var Cust = require('../models/cust');
var Res = require('../models/reservations');
var async = require('async');
var bcrypt = require('bcrypt');
var session = require('express-session');
var cookieParser = require('cookie-parser');

const saltRounds = 10;

exports.login_get = function(req, res) {
    res.render('login', { title: 'SEATS'});
};

exports.login_post =  [
    // Validate fields.
    
    body('email').isLength({ min: 5 }).trim().withMessage('Email should be longer than five characters.')
        .isEmail().withMessage('Not a valid email address.'),
    body('password').isLength({ min: 5 }).trim().withMessage('password should be longer than five characters.'),
    //body('password2').isLength({ min: 5 }).trim().withMessage('password should be longer than five characters.'),
    
    // Sanitize fields.
    sanitizeBody('email').trim().escape(),
    sanitizeBody('password').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('login', { title: 'SEATS', name: req.body, errors: errors.array() });
            return;
        }
        else {
            Cust.findOne({'email':req.body.email},'_id email password first_name last_name phone_number', function(err, customer){
                if(err) return(err);
                if(customer==null){
                    findRest();
                }
                else{
                    bcrypt.compare(req.body.password, customer.password, function(err, result){
                        if(err) return(err);
                        if(result === true){
                            req.session.user = customer;
                            res.redirect(customer.url);
                        } else {
                            res.render('login', { title: 'SEATS', name: req.body, errors: ["password does not match"]});
                        }
                    });
                }
            });

            findRest = function(err, result){
                Rest.findOne({'email':req.body.email}, '_id email password rest_name', function(err, restaurant){
                    if(err) return (err);
                    if(restaurant==null){
                        res.render('login', { title: 'SEATS', name: req.body, errors: ["id does not exist"]});
                    } else{
                        bcrypt.compare(req.body.password, restaurant.password, function(err, result){
                            if(err) return (err);
                            if(result === true){
                                req.session.user = restaurant;
                                res.redirect(restaurant.url);
                            }else{
                                res.render('login', { title: 'SEATS', name: req.body, errors: ["password does not match"]});
                            }
                        });
                    }
                });
            }
        }
    }
];

exports.change_password_get = function(req,res){
    res.render('change_password', {title: "Change Password"});
}

exports.change_password_post = function(req,res){
    if(req.session.user.first_name){
        Cust.findOneAndUpdate({'email': req.session.user.email}, {$set:{password: req.body.new_password}}, {}, function(err, customer){
            if(err) {
                console.log(err);
                return err;
            }
            else{
                console.log(customer);
                res.redirect(customer.url);
            }
        });
    }
    if(req.session.user.rest_name){

    }
}

exports.auth = function(req, res, next) {
    if (req.session.user)
        return next();
    return res.render('auth_err');
};

exports.custAuth = function(req, res, next) {
    if (req.session.user)
        if(req.session.user.first_name)
            return next();
    return res.render('auth_err');
};

exports.restAuth = function(req, res, next) {
    if (req.session.user)
        if(req.session.user.rest_name)
            return next();
    return res.render('auth_err');
};

exports.logout = function(req,res){
    req.session.destroy(function(){
        console.log("user logged out.")
    });
    res.redirect('/');
}

