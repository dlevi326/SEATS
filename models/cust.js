var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CustomerSchema = new Schema(
  {
    first_name: {type: String, required: true, max: 100},
    last_name: {type: String, required: true, max: 100},
    phone_number: {type: String, required: true, max: 12},
    address: {type: String, required: true, max: 12},
  }
);

// Virtual for author's full name
CustomerSchema
.virtual('name')
.get(function () {
  return this.last_name + ', ' + this.first_name;
});

// Virtual for author's URL
CustomerSchema
.virtual('url')
.get(function () {
  return '/users/cust/' + this._id + '/home';
});

//Export model
module.exports = mongoose.model('Cust', CustomerSchema);
