var User = require('../model/user.js');
var bcrypt = require('bcrypt');
var flash = require('../util/flash.js');


module.exports = function (app) {

	app.all('*', function (req, res, next) {
		res.header("Access-Control-Allow-Origin", "http://localhost:8080");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
		res.header("X-Powered-By", ' 3.2.1');
		res.header("Content-Type", "application/json;charset=utf-8");
		next();
	});

	app.post('/login', function (req, res, next) {
		var temp = {
			email: req.body.email,
			encryptedPassword: req.body.password
		}

		bcrypt.hash(temp.encryptedPassword, 10, function (err, encryptedPassword) {

			if(err) return next(err);

			User.findOne({
				email: temp.email
			}, function (err, user) {
				if(err) return next(err);

				if(!user) {
					res.send(flash('error','user not exist',null));
				}
				bcrypt.compare(temp.encryptedPassword, encryptedPassword, function (err, valid) {
					if(err) return next(err);

					if(!valid) {
						res.send(flash('error','password not match',temp));
						return ;
					}
					if(valid) {
						res.send(flash('success','login success',{
							username: user.username,
							email: user.email,
							signature: user.signature
						}));
					}
				});
			});
		});
	});

	app.post('/signin', function (req, res, next) {
		var temp = {
			username: req.body.username,
			encryptedPassword: req.body.password,
			email: req.body.email,
			signature: req.body.signature
		}

		bcrypt.hash(temp.encryptedPassword, 10, function (err, encryptedPassword) {
			if(err) return next(err);

			User.findOne({
				email: temp.email
			}, function (err, user) {
				if(err) return next(err);
				if(user) {
					res.send(flash('error','user already exist',temp));
					return ;
				}
				temp.encryptedPassword = encryptedPassword;
				var user = new User(temp);

				User.create(user,function (err, user) {
					if(err) return next(err);

					console.log(user);
					res.send(flash('success','register success',{
						username: user.username,
						email: user.email,
						signature: user.signature
					}));
				});
			});
		});
	});

	app.post('/search', function (req, res, next) {
		var content = req.body.content;
		var pattern = new RegExp('^.*' + content + '.*$')
		User.find({ '$or' :[{ 'username' : pattern },{ 'email' : content }]}, function (err, users) {
			if(err) return next(err);

			// console.log(data);
			res.send(flash('success','search success',users));
		})

	})







}