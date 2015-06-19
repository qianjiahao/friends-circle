var User = require('../model/user.js');
var Hint = require('../model/hint.js');
var News = require('../model/news.js');
var Room = require('../model/room.js');
var bcrypt = require('bcrypt');
var flash = require('../util/flash.js');
var moment = require('moment');
var markdown = require('markdown').markdown;

module.exports = function (app) {

	// use cors m instead of it 

	// app.all('*', function (req, res, next) {
	// 	res.header("Access-Control-Allow-Origin", "http://localhost:8080");
	// 	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	// 	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	// 	res.header("X-Powered-By", ' 3.2.1');
	// 	res.header("Content-Type", "application/json;charset=utf-8");
	// 	next();
	// });

	/*
		login system
	 */
	app.post('/login', function (req, res, next) {
		var temp = {
			email: req.body.email,
			encryptedPassword: req.body.password
		}

		console.log(temp.email,temp.encryptedPassword);
		User.findOne({ 'email':temp.email }, function (err, user) {
			if(err) return next(err);

			if(!user) {
				res.send(flash(404,'user not exist',temp));
				return ;
			}
			bcrypt.compare(temp.encryptedPassword, user.encryptedPassword, function (err, valid) {
				if(err) return next(err);
				
				if(!valid) {
					res.send(flash(409,'password not match',temp));
					return ;
				}

				res.send(flash(200,'login success',{
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

	/*
		logout system
	 */
	app.post('/logout', function (req, res, next) {
		User.findOne({ '_id':req.body.id }, function (err, user) {
			if(err) return next(err);

			user.update({ 'online':false }, function (err, user) {
				if(err) return next(err);

				res.send({});
			});
		});
	});

	/*
		sign in system
	 */
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

			User.findOne({ 'email':temp.email }, function (err, user) {
				if(err) return next(err);

				if(user) {
					res.send(flash(409,'user already exist',temp));
					return ;
				}
				temp.encryptedPassword = encryptedPassword;

				User.create(temp, function (err, user) {
					if(err) return next(err);

					res.send(flash(200,'register success',{
						username: temp.username,
						email: temp.email,
						signature: temp.signature,
						id: user._id
					}));
				});
			});
		});
	});

	/*
		search soemone as friends , use nickname or email 
	 */
	app.post('/search', function (req, res, next) {
		
		var content = req.body.content;
		var pattern = new RegExp('^.*' + content + '.*$')
		
		User.find({ '$or' :
			[
				{ 'username' : pattern },
				{ 'email' : content }
			]
		},{
			'_id': 1, 
			'username': 1, 
			'signature': 1
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
		get all hints by user id
	 */
	app.get('/hints/all/:targetId', function (req, res, next) {
		Hint.find({ 'targetId':req.params.targetId }, function (err, hints) {
			if(err) return next(err);

			res.send({
				hints: hints
			});
		});
	});

	/*
		get total count of unmarked hint by user id
	 */
	app.get('/hints/count/:targetId/:mark', function (req, res, next) {
		Hint.count({ 'targetId':req.params.targetId, 'mark':req.params.mark }, function (err, total) {
			if(err) return next(err);

			res.send({
				total: total
			});
		});
	});

	/*
		mark hint 
	 */
	app.post('/hint/mark', function (req, res, next) {
		Hint.findOne({'_id': req.body.id }, function (err, hint) {
			if(err) return next(err);

			hint.update({ 'mark': true }, function (err, hint) {
				if(err) return next(err);

				User.update({ '_id' : req.body.targetId }, { '$inc' : { 'hints': -1 } }, function (err, user) {
					if(err) return next(err);

					res.send({});

				});
			});
		});
	});

	/*
		accept hint 
	 */
	app.post('/hint/accept', function (req, res, next) {
		Hint.findOne({ '_id': req.body.id }, function (err, hint) {
			if(err) return next(err);

			hint.update({ 'accept': true , 'mark': true }, function (err) {
				if(err) return next(err);

				User.update({ '_id' : req.body.targetId }, { '$inc' : { 'hints': -1 } }, function (err, user) {
					if(err) return next(err);

					res.send(hint);
				});
			});
		});
	});

	/*
		add someone into friends list 
	 */
	app.post('/friend/accept', function (req, res, next) {
		User.findOne({ '_id': req.body.senderId }, function (err, user) {
			if(err) return next(err);

			if(user.friends.indexOf(req.body.targetId) < 0) {
				user.update({ '$push': { 'friends': req.body.targetId } }, function (err, user) {
					if(err) return next(err);

					User.findOne({ '_id': req.body.targetId }, function (err, user) {
						if(err) return next(err);
						
						if(user.friends.indexOf(req.body.senderId) < 0) {
							user.update({ '$push': { 'friends':req.body.senderId } }, function (err, user) {
								if(err) return next(err);
						
								res.send({});

							});
						}
					});
				});
			}
		});
	});

	/*
		get all friends by user id
	 */
	app.get('/friends/all/:userId', function (req, res, next) {

		User.findOne({ '_id': req.params.userId }, function (err, user) {
			if(err) next(err);

			User.find({ '_id': { '$in': user.friends } }, { '_id':1, 'username':1, 'email':1, 'online':1 }, function (err, users) {
				if(err) return next(err);

				res.send(users);
			});
		});
	});

	/*
		get user information by user id
	 */
	app.get('/user/:userId', function (req, res, next) {
		User.findOne({ '_id':req.params.userId }, function (err, user) {
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

	app.post('/user/save', function (req, res, next) {
		User.findOne({ '_id':req.body.userId }, function (err, user) {
			if(err) return next(err);

			user.update({ 'username':req.body.username, 'signature':req.body.signature }, function (err) {
				if(err) return next(err);

				User.findOne({ '_id':req.body.userId }, function (err, user) {
					if(err) return next(err);

					res.send(user);
				});
			});
		});
	});

	/*
		create news
	 */
	app.post('/news/create', function (req, res, next) {
		var temp = {
			publishId: req.body.publishId,
			publishContent: req.body.publishContent,
			date: new Date(),
			isMarkdown: req.body.isMarkdown,
			support: []
		};

		if(temp.isMarkdown) {
			temp.publishContent = markdown.toHTML(temp.publishContent);
		}

		News.create(temp, function (err) {
			if(err) return next(err);

			res.send({});
		});
	});

	/*
		save news changes
	 */
	app.post('/news/save', function (req, res, next) {
		News.findOne({ '_id':req.body.newsId }, function (err, news) {
			if(err) return next(err);
			
			news.publishContent = req.body.publishContent;
			
			news.save(function (err, news) {
				if(err) return next(err);

				res.send({});
			});
		});
	});

	/*
		remove news
	 */
	app.post('/news/remove', function (req, res, next) {
		News.remove({ '_id':req.body.newsId }, function (err) {
			if(err) return next(err);

			res.send({});
		});
	});

	/*
		support news
	 */
	app.post('/news/support', function (req, res, next) {
		News.findOne({ '_id':req.body.newsId }, function (err, news) {
			if(err) return next(err);

			news.update({ '$push':{ 'support':req.body.supporter } }, function (err) {
				if(err) return next(err);

				res.send({});
			});
		});
	});

	/*
		get all news from start to page end 
	 */
	app.get('/news/all/:userId/:page', function (req, res, next) {
		var page = req.params.page;
		var limit = 7;
		
		User.findOne({ '_id': req.params.userId }, function (err, user) {
			if(err) return next(err);

			var array = user.friends;
			array.push(req.params.userId);
			
			News.find({ 'publishId': { '$in':array } }, function (err, newsList) {
				if(err) return next(err);

				newsList = newsList.slice(-page*limit,newsList.length);
				res.send(newsList);
			});
		});
	});

	/*
		create room
	 */
	app.post('/room/create', function (req, res, next) {
		var temp = {
			roomInfo: req.body.roomInfo,
			createrId: req.body.createrId,
			createdDate: req.body.createdDate,
			members: req.body.members,
			currentMembers: req.body.currentMembers
		}
		Room.create(temp, function (err, room) {
			if(err) return next(err);

			res.send(room);
		});
	});

	/*
		get all rooms by user id
	 */
	app.get('/rooms/:userId', function (req, res, next) {
		Room.find({ 'members':req.params.userId }, function (err, rooms) {
			if(err) return next(err);

			res.send(rooms);
		});
	});

	/*
		get room info by room id
	 */
	app.get('/room/:roomId', function (req, res, next) {

		Room.findOne({ '_id':req.params.roomId }, function (err, room) {
			if(err) return next(err);

			res.send(room);
		});
	});

	/*
		join room 
		if you are staying a room and join a same room , no change .
		if you are staying a room and join a different room , remove old room info and add new info into new room .
		if you are not staying a room , just add info into new room .
	 */
	app.post('/room/join', function (req, res, next) {
		User.findOne({ '_id':req.body.userId }, function (err, user) {
			if(err) return next(err);

			if(user.currentRoom !== req.body.roomId) {
				Room.findOne({ '_id':req.body.roomId }, function (err, room) {
					if(err) return next(err);

					var index = room.currentMembers.indexOf(req.body.userId);
					if(index >= 0) {
						room.currentMembers.splice(index,1);
					}

					room.save(function (err, room) {
						if(err) return next(err);

						user.update({ 'currentRoom': req.body.roomId }, function (err, user) {
							if(err) return next(err);

							Room.findOne({ '_id':req.body.roomId }, function (err, room) {
								if(err) return next(err);

								if(room.currentMembers.indexOf(req.body.userId) < 0) {
									room.currentMembers.push(req.body.userId);
								}
								room.save(function (err) {
									if(err) return next(err);

									res.send({});
								});
							})
						});
					});
				})
			}else{
				res.send({});
			}
		})
	});

	/*
		exit room . remove info from old room .
	 */
	app.post('/room/exit', function (req, res, next) {
		User.findOne({ '_id': req.body.userId }, function (err, user) {
			if(err) return next(err);

			if(user.currentRoom) {
				Room.findOne({ '_id': user.currentRoom }, function (err, room) {
					if(err) return next(err);

					var index = room.currentMembers.indexOf(user._id);
					if(index >= 0) {
						room.currentMembers.splice(index,1);
					}
					room.save(function (err) {
						if(err) return next(err);
					
						user.update({ 'currentRoom': '' }, function (err, user) {
							if(err) return next(err);

							res.send({});
						});
					});
				});
			}
		});
	});





}