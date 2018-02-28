var Reservation = require('../models/reservations');

// Display list of all Authors.
exports.reservation_list = function(req, res, next) {
	Reservation.find().populate('creator rest')
		.exec(function(err, list_res){
			if(err){return next(err);}
			// Success
			res.render('res_list',{title: 'Reservation lists', res_list: list_res});
		});
};

// Display detail page for a specific Author.
exports.reservation_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Reservation detail: ' + req.params.id);
};

// Display Author create form on GET.
exports.reservation_create_get = function(req, res) {
	res.render('res_create', {title: 'Create Reservation', error: 'errors'})
    //res.send('NOT IMPLEMENTED: Reservation create GET');
};

// Handle Author create on POST.
exports.reservation_create_post = function(req, res) {
	res.send('NOT IMPLEMENTED: Reservation create POST');
};

// Display Author delete form on GET.
exports.reservation_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Reservation delete GET');
};

// Handle Author delete on POST.
exports.reservation_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Reservation delete POST');
};
