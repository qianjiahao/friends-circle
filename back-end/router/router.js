var User = require('../model/user.js');
var Hint = require('../model/hint.js');
var News = require('../model/news.js');
var Room = require('../model/room.js');
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

			User.findOne()
				.where('email')
				.equals(temp.email)
				.exec(function (err, user) {
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
						user.update({ 'online': true }, function (err) {
							if(err) return next(err);
						});
					});
					
				});
			});
	});

	app.post('/logout', function (req, res, next) {
		User.findOne()
			.where('_id')
			.equals(req.body.id)
			.exec(function (err, user) {
				if(err) return next(err);

				user.update({ 'online':false }, function (err, user) {
					if(err) return next(err);

					console.log('logout : ' + user);
				});
			});
	});
	app.post('/signin', function (req, res, next) {
		var temp = {
			username: req.body.username,
			encryptedPassword: req.body.password,
			email: req.body.email,
			signature: req.body.signature,
			hints: 0,
			online: true,
			currentRoom: ''
		}

		bcrypt.hash(temp.encryptedPassword, 10, function (err, encryptedPassword) {
			if(err) return next(err);

			User.findOne()
				.where('email')
				.equals(temp.email)
				.exec(function (err, user) {

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
	app.get('/hints/all/:targetId', function (req, res, next) {
		Hint.find()
			.where('targetId')
			.equals(req.params.targetId)
			.sort('mark')
			.sort('-date')
			.exec(function (err, hints) {

				if(err) return next(err);
				res.send({
					hints: hints
				});
		});
	});

	/*
		get total count of unmarked hint .
	 */
	app.get('/hints/count/:targetId/:mark', function (req, res, next) {
		Hint.count()
			.where('targetId')
			.equals(req.params.targetId)
			.where('mark')
			.equals(req.params.mark)
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
					res.send({});

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

			if(user.friends.indexOf(req.body.targetId) < 0) {
				
				user.update({ '$push': { 'friends': req.body.targetId } }, function (err, user) {
					if(err) return next(err);
				});
			}
		});

		User.findOne({ '_id': req.body.targetId }, function (err, user) {
			if(err) return next(err);
			if(user.friends.indexOf(req.body.senderId) < 0) {
				user.update({ '$push': { 'friends':req.body.senderId } }, function (err, user) {
					if(err) return next(err);
			
				});
			}
		});
		res.send({});
	});

	app.get('/friends/all/:userId', function (req, res, next) {

		User.findOne({ '_id': req.params.userId }, function (err, user) {
			if(err) next(err);

			User.find({ '_id': { '$in': user.friends } }, { '_id':1, 'username':1, 'email':1, 'online':1 }, function (err, users) {
				if(err) return next(err);

				res.send(users);
			});
		});
	});

	app.get('/user/:userId', function (req, res, next) {
		User.findOne()
			.where('_id')
			.equals(req.params.userId)
			.exec(function (err, user) {
				if(err) return next(err);
				
				res.send({
					username: user.username,
					email: user.email,
					signature: user.signature,
					id: user._id,
					friends: user.friends,
					currentRoom: user.currentRoom
				});
			});
	});

	app.post('/news/create', function (req, res, next) {
		var temp = {
			publishId: req.body.publishId,
			publishContent: req.body.publishContent,
			date: new Date()
		};

		News.create(temp, function (err) {
			if(err) return next(err);

			res.send({});
		});
	});

	app.get('/news/all/:userId', function (req, res, next) {
		User.findOne({ '_id': req.params.userId }, function (err, user) {
			if(err) return next(err);

			var array = user.friends;
			array.push(req.params.userId);
			News.find({ 'publishId': { '$in':array } }, { 'date':1, 'publishId':1, 'publishContent':1 }, function (err, news) {
				if(err) return next(err);

				res.send(news);
			});
		});
	});

	app.post('/room/create', function (req, res, next) {
		var temp = {
			roomInfo: req.body.roomInfo,
			createrId: req.body.createrId,
			createdDate: req.body.createdDate,
			members: req.body.members,
			currentMembers: req.body.currentMembers
		}
		console.log(temp);
		Room.create(temp, function (err, room) {
			if(err) return next(err);

			res.send({
				room: room
			});
		});
	});

	app.get('/rooms/:userId', function (req, res, next) {
		Room.find()
			.where('members')
			.equals(req.params.userId)
			.exec(function (err, rooms) {
				if(err) return next(err);

				res.send({
					rooms: rooms
				});
			});
	});

	app.post('/room/join', function (req, res, next) {
		User.findOne()
			.where('_id')
			.equals(req.body.userId)
			.exec(function (err, user) {
				if(err) return next(err);

				if(user.currentRoom !== req.body.roomId) {

					console.log('enter different room !')
					Room.findOne()
						.where('_id')
						.equals(req.body.roomId)
						.exec(function (err, room) {
							if(err) return next(err);

							var index = room.currentMembers.indexOf(req.body.userId);
							if(index >= 0) {
								room.currentMembers.splice(index,1);
								console.log('remove old room members ')
							}

							room.save(function (err, room) {
								if(err) return next(err);
							});
						});

					user.update({ 'currentRoom': req.body.roomId }, function (err, user) {
						if(err) return next(err);

						console.log('update' + user);
					});

					Room.findOne()
						.where('_id')
						.equals(req.body.roomId)
						.exec(function (err, room) {
							if(err) return next(err);

							if(room.currentMembers.indexOf(req.body.userId) < 0) {
								console.log('first time join room...')
								room.currentMembers.push(req.body.userId);
								
							}
							console.log('second time join room...');
							room.save(function (err) {
								if(err) return next(err);

								res.send({});
							});
						});
				}else{
					console.log('enter same room !');
				}
			});
	});

	app.get('/room/:roomId', function (req, res, next) {

		Room.findOne()
			.where('_id')
			.equals(req.params.roomId)
			.exec(function (err, room) {
				if(err) return next(err);

				res.send({
					room: room
				});
			});
	});





}