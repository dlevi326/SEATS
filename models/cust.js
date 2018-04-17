var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CustomerSchema = new Schema(
{
	email: {type: String, unique: true, required: true, trim: true},
  	password: {type: String, required: true, max: 20},
   	first_name: {type: String, required: true, trim: true},
    last_name: {type: String, required: true, trim: true},
    phone_number: {type: String, required: true, max: 12}
  }
);

// Virtual for Customer's full name
CustomerSchema
.virtual('name')
.get(function () {
  return this.last_name + ', ' + this.first_name;
});

// Virtual for Customer's URL
CustomerSchema
.virtual('url')
.get(function () {
  return '/users/cust/' + this._id;
});

//Export model
module.exports = mongoose.model('Cust', CustomerSchema);
