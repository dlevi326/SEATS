var Cust = require('../models/cust');

// Display list of all Authors.
exports.customer_list = function(req, res) {
    res.send('NOT IMPLEMENTED: Customer list');
};

// Display detail page for a specific Author.
exports.customer_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Customer detail: ' + req.params.id);
};

// Display Author create form on GET.
exports.customer_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Customer create GET');
};

// Handle Author create on POST.
exports.customer_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Customer create POST');
};

// Display Author delete form on GET.
exports.customer_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Customer delete GET');
};

// Handle Author delete on POST.
exports.customer_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Customer delete POST');
};
