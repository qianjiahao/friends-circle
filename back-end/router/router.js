var User = require('../model/user.js');
var Hint = require('../model/hint.js');
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
					res.send(flash('error','user not exist',temp));
				}
				bcrypt.compare(temp.encryptedPassword, encryptedPassword, function (err, valid) {
					if(err) return next(err);

					if(!valid) {
						res.send(flash('error','password not match',temp));
						return ;
					}
					res.send(flash('success','login success',{
						username: user.username,
						email: user.email,
						signature: user.signature,
						id: user._id
					}));
				});
			});
		});
	});

	app.post('/signin', function (req, res, next) {
		var temp = {
			username: req.body.username,
			encryptedPassword: req.body.password,
			email: req.body.email,
			signature: req.body.signature,
			hints: []
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

					res.send(flash('success','register success',{
						username: user.username,
						email: user.email,
						signature: user.signature,
						id: user._id
					}));
				});
			});
		});
	});

	app.post('/search', function (req, res, next) {
		var content = req.body.content;
		var pattern = new RegExp('^.*' + content + '.*$')
		User.find({ '$or' :[{ 'username' : pattern },{ 'email' : content }]},{
			'_id': 1, 'username': 1, 'signature': 1
		}, function (err, users) {
			if(err) return next(err);

			res.send(flash('success','search success',users));
		});
	});

	app.post('/hints', function (req, res, next) {
		var hint = new Hint({
			targetId:req.body.targetId,
			hintType: req.body.hintType,
			hintContent: req.body.hintContent,
			senderId: req.body.senderId
		});
		Hint.create(hint, function (err, hint) {
			if(err) return next(err);

			User.findOne({ '_id': req.body.targetId }, function (err, user) {
				if(err) return next(err);

				user.hints.push(hint._id);
				user.save(function (err) {
					if(err) return next(err);

					res.send({
						targetId: req.body.targetId,
						hints: user.hints
					});
				});
			});
		});
	});

	app.get('/hintsCount', function (req, res, next) {
		User.findOne({ '_id' : req.query.id}, function (err, user) {
			if(err) return next(err);

			res.send({
				hints: user.hints
			});
		});
	});








}