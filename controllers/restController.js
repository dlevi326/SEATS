var Rest = require('../models/rest');

// Display list of all Authors.
exports.rest_list = function(req, res) {
	Rest.find()
		.exec(function(err, list_rest){
			if(err){return next(err);}
			// Success
			res.render('rest_list',{title: 'Restaurant lists', rest_list: list_rest});
		});
};

// Display detail page for a specific Author.
exports.rest_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Rest detail: ' + req.params.id);
};

// Display Author create form on GET.
exports.rest_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Rest create GET');
};

// Handle Author create on POST.
exports.rest_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Rest create POST');
};

// Display Author delete form on GET.
exports.rest_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Rest delete GET');
};

// Handle Author delete on POST.
exports.rest_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Rest delete POST');
};
