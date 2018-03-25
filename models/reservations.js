var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var ReservationSchema = new Schema(
  {
    creator: {type: Schema.ObjectId, ref: 'Cust', required: true},
    date: {type: Date, required: true},
    people_num: {type: Number, required: true},
    rest: {type: Schema.ObjectId, ref: 'Rest', required: true},
  }
);

// Virtual for author's full name
ReservationSchema.virtual('date_created_formatted')
.get(function(){
	return moment(this.date_created).format('MMMM Do, YYYY');
});

ReservationSchema
.virtual('name')
.get(function () {
  return this.creator.first_name+' : '+this.rest.rest_name+' : '+this.date_created_formatted;
});

ReservationSchema
.virtual('formatDate')
.get(function (){
	return moment(this.date).format('MM/DD/YYYY hh:mm:ss a')
});

// Virtual for author's URL
ReservationSchema
.virtual('url')
.get(function () {
  return '/users/reservation/' + this._id;
});

//Export model
module.exports = mongoose.model('Reservation', ReservationSchema);
