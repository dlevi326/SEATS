
exports.login_get = function(req, res) {
    res.render('login', { title: 'SEATS', data: req });
};