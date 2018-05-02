var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var RestSchema = new Schema(
{
    email: {type: String, unique: true, required: true, trim: true},
    password: {type: String, required: true, max: 20},
    rest_name: {type: String, required: true, trim: true},
    max_capacity: {type: Number, required: true},
    phone_number: {type: String, required: true, max: 12},
    Address: {type: String, required: true, max: 12},
    open_time: {type: Date, required: true},
    close_time: {type: Date, required: true}
  }
);

// Virtual for Restaurant's full name
RestSchema
.virtual('name')
.get(function () {
  return this.rest_name;
});

// Formats date
RestSchema
.virtual('openFormatDate')
.get(function (){
  return moment(this.open_time).format('hh:mm:ss a')
});
RestSchema
.virtual('closeFormatDate')
.get(function (){
  return moment(this.close_time).format('hh:mm:ss a')
});

// Virtual for Restaurant's URL
RestSchema
.virtual('url')
.get(function () {
  return '/users/rest/' + this._id;
});

//Export model
module.exports = mongoose.model('Rest', RestSchema);
