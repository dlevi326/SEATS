var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ReservationSchema = new Schema(
  {
    creator: {type: Schema.ObjectId, ref: 'Cust', required: true},
    date_created: {type: Date, required: true},
    people_num: {type: Number, required: true},
    rest: {type: Schema.ObjectId, ref: 'Rest', required: true},
  }
);

// Virtual for author's full name
ReservationSchema
.virtual('name')
.get(function () {
  return this.creator;
});

// Virtual for author's URL
ReservationSchema
.virtual('url')
.get(function () {
  return '/users/resinfo/' + this._id;
});

//Export model
module.exports = mongoose.model('Reservation', ReservationSchema);
