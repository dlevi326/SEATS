var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RestSchema = new Schema(
{
    email: {type: String, unique: true, required: true, trim: true},
    password: {type: String, required: true, max: 20},
    rest_name: {type: String, required: true, trim: true, unique: true},
    max_capacity: {type: Number, required: true},
    phone_number: {type: String, required: true, max: 12},
    Address: {type: String, required: true, max: 12},
    open_time: {type: Date, required: true},
    close_time: {type: Date, required: true}
  }
);

// Virtual for author's full name
RestSchema
.virtual('name')
.get(function () {
  return this.rest_name;
});

// Virtual for author's URL
RestSchema
.virtual('url')
.get(function () {
  return '/users/rest/' + this._id;
});

//Export model
module.exports = mongoose.model('Rest', RestSchema);
