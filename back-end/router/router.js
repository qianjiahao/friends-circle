var User = require('../model/user.js');
var Hint = require('../model/hint.js');
var bcrypt = require('bcrypt');
var flash = require('../util/flash.js');
var moment = require('moment');

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
			hints: 0
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

	/*
		create a hint and post it to target people .
	 */
	app.post('/hint', function (req, res, next) {
		var hint = new Hint({
			targetId:req.body.targetId,
			hintType: req.body.hintType,
			hintContent: req.body.hintContent,
			senderId: req.body.senderId,
			senderName: req.body.senderName,
			date: moment().format('MMMM Do YYYY, h:mm:ss a'),
			mark: req.body.mark,
			accept: req.body.accept
		});
		Hint.create(hint, function (err, hint) {
			if(err) return next(err);

			User.findOne({ '_id': req.body.targetId }, function (err, user) {
				if(err) return next(err);

				user.update({ '$inc' : { 'hints': 1 } }, function (err, user) {
					if(err) return(err);
					
					console.log(user);	
					res.send({
						targetId: req.body.targetId
					});
				});
			});
		});
	});

	/*
		get all hints .
	 */
	app.get('/hints/all', function (req, res, next) {
		Hint.find()
			.where('targetId')
			.equals(req.query.targetId)
			.sort('mark')
			.sort('-date')
			.exec(function (err, hints) {

				if(err) return next(err);

				res.send({
					hints: hints
				});
		})
	});

	/*
		get total count of unmarked hint .
	 */
	app.get('/hints/count', function (req, res, next) {
		Hint.count()
			.where('targetId')
			.equals(req.query.id)
			.where('mark')
			.equals(false)
			.exec(function (err, total) {
				if(err) return next(err);

				console.log('total : ' + total);
				res.send({
					total: total
				});
			});
	});

	/*
		change the variable : mark to the true value , mark the hint .
	 */
	app.post('/hint/mark', function (req, res, next) {
		Hint.findOne({'_id': req.body.id }, function (err, hint) {
			if(err) return next(err);

			hint.update({ 'mark': true }, function (err, hint) {
				if(err) return next(err);
				console.log(hint);

				User.update({ '_id' : req.body.targetId }, { '$inc' : { 'hints': -1 } }, function (err, user) {
					if(err) return next(err);

					console.log('mark : ',user);

				});
			});
		});
	});

	/*
		change the variable : accept , mark to true value , accept and mark the hint .
	 */
	app.post('/hint/accept', function (req, res, next) {
		Hint.findOne({ '_id': req.body.id }, function (err, hint) {
			if(err) return next(err);

			hint.update({ 'accept': true , 'mark': true }, function (err) {
				if(err) return next(err);

				User.update({ '_id' : req.body.targetId }, { '$inc' : { 'hints': -1 } }, function (err, user) {
					if(err) return next(err);

					res.send({
						hint: hint
					});
					console.log('accept : ',user);
				});
			});
		});
	});

	/*
		add someone into friends list .
	 */
	app.post('/friend/accept', function (req, res, next) {
		User.findOne({ '_id': req.body.senderId }, function (err, user) {
			if(err) return next(err);

			user.update({ '$push': { 'friends': req.body.targetId } }, function (err, user) {
				if(err) return next(err);
			});
		});

		User.findOne({ '_id': req.body.targetId }, function (err, user) {
			if(err) return next(err);

			user.update({ '$push': { 'friends':req.body.senderId } }, function (err, user) {
				if(err) return next(err);
		
			});

		});

		res.send({})

	});

	app.get('/friends/all', function (req, res, next) {

		User.findOne({ '_id': req.query.id }, function (err, user) {
			if(err) next(err);

			User.find({ '_id': { '$in': user.friends } }, { '_id':1, 'username':1, 'email':1 }, function (err, users) {
				if(err) return next(err);

				console.log(users);
				res.send(users);
			});
		});

	});

	app.get('/user', function (req, res, next) {
		User.findOne({ '_id': req.query.id }, function (err, user) {
			if(err) return next(err);

			res.send({
				username: user.username,
				email: user.email,
				signature: user.signature,
				id: user._id,
				friends: user.friends
			});
		});
	});



}