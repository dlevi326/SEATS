#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url');

var async = require('async')
var Cust = require('./models/cust')
var Reservation = require('./models/reservations')
var Rest = require('./models/rest')



var mongoose = require('mongoose');
var mongoDB = 'mongodb://seats:seats1234@ds235768.mlab.com:35768/seats';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var custs = []
var reservations = []
var rests = []


function custCreate(first_name, family_name, phone_number,address, cb) {
  customerdetail = {
    first_name: first_name, 
    last_name: family_name,
    phone_number: phone_number,
    address: address
  }

  var cust = new Cust(customerdetail);
       
  cust.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Customer: ' + cust);
    custs.push(cust)
    cb(null, cust)
  }  );
}

function createCustomers(cb) {
    async.parallel([
        function(callback) {
          custCreate('David', 'Levi', '5169931641', '41 Cooper Square', callback);
        },
        function(callback) {
          custCreate('Chris', 'Kim', '123456789', '41 Bowery Street', callback);
        },
        function(callback) {
          custCreate('Isaac', 'Asimov', '9876654423', '12 Old Lane', callback);
        },
        ],
        // optional callback
        cb);
}

function restCreate(rest_name, max_capacity, phone_number,address, cb) {
  restdetail = {
    rest_name: rest_name, 
    max_capacity: max_capacity,
    phone_number: phone_number,
    address: address
  }

  var rest = new Rest(restdetail);
       
  rest.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Resteraunt: ' + rest);
    rests.push(rest)
    cb(null, rest)
  }  );
}

function createRests(cb) {
    async.parallel([
        function(callback) {
          restCreate('Resteraunt 1', '25','123445678', '41 Cooper Square', callback);
        },
        function(callback) {
          restCreate('Resteraunt 2', '35', '123456789', '41 Bowery Street', callback);
        },
        function(callback) {
          restCreate('Resteraunt 3', '1009', '9876654423', '12 Old Lane', callback);
        },
        ],
        // optional callback
        cb);
}

function reservationCreate(creator, date_created, people_num,rest, cb) {
  reservationdetail = {
    creator: creator, 
    date_created: date_created,
    people_num: people_num,
    rest: rest
  }

  var reservation = new Reservation(reservationdetail);
       
  reservation.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Reservation: ' + reservation);
    reservations.push(reservation)
    cb(null, reservation)
  }  );
}

function createReservation(cb) {
    async.parallel([
        function(callback) {
          reservationCreate(custs[0], '1920-01-02',12, rests[0], callback);
        },
        function(callback) {
          reservationCreate(custs[1], '1999-01-02', 40, rests[1], callback);
        },
        function(callback) {
          reservationCreate(custs[2], '2013-06-23', 1, rests[2], callback);
        },
        ],
        // optional callback
        cb);
}

async.series([
    createCustomers,
    createRests,
    createReservation
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('CustInstances: '+custs);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



