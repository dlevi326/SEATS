var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RestSchema = new Schema(
  {
    rest_name: {type: String, required: true, max: 100},
    max_capacity: {type: Number, required: true},
    phone_number: {type: String, required: true, max: 12},
    Address: {type: String, required: true, max: 12},
    open_time: {type: String, required: true},
    close_time: {type: String, required: true}
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
