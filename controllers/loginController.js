const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var Rest = require('../models/rest');
var Cust = require('../models/cust');
var Res = require('../models/reservations');
var async = require('async');
var bcrypt = require('bcrypt');

const saltRounds = 10;

exports.login_get = function(req, res) {
    res.render('login', { title: 'SEATS'});
};

exports.login_post =  [
    // Validate fields.
    
    body('email').isLength({ min: 5 }).trim().withMessage('Email should be longer than five characters.')
        .isEmail().withMessage('Not a valid email address.'),
    body('password').isLength({ min: 5 }).trim().withMessage('password should be longer than five characters.'),
    //body('password2').equals(body('password')).withMessage('password does not match'),
    
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
            Cust.findOne({'email':req.body.email},'_id password', function(err, customer){
                if(err) return(err);
                if(customer==null){
                    findRest();
                }
                else{
                    bcrypt.compare(req.body.password, customer.password, function(err, result){
                        if(err) return(err);
                        if(result === true){
                            res.redirect(customer.url);
                        } else {
                            res.render('login', { title: 'SEATS', name: req.body, errors: ["password does not match"]});
                        }
                    });
                }
            });

            findRest = function(err, result){
                Rest.findOne({'email':req.body.email}, '_id password', function(err, restaurant){
                    if(err) return (err);
                    if(restaurant==null){
                        res.render('login', { title: 'SEATS', name: req.body, errors: ["id does not exist"]});
                    } else{
                        bcrypt.compare(req.body.password, restaurant.password, function(err, result){
                            if(err) return (err);
                            if(result === true){
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

exports.logout_get = function(req,res){
    res.send("Logout get not implemented yet");
}

exports.logout_post = function(req,res){
    res.send("Logout post not implemented yet");
}