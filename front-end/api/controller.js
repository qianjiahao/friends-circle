(function() {

	app
		.controller('BodyController', ['$rootScope', function ($rootScope){
			
			$rootScope.totalHints = 0;
			$rootScope.isSignin = false;
			$rootScope.currentRoom = '';

		}])
		.controller('NavbarController', ['$scope','$rootScope','$window','socket','AuthFactory','HintFactory', function ($scope, $rootScope, $window, socket, AuthFactory, HintFactory){

			var isNeedFoldCurrent,
				isNeedFoldCache,
				minWindowSize = 768;

			$rootScope.isAuth = AuthFactory.checkAuth('User');
			if(AuthFactory.checkAuth('User')) {
				socket.emit('update hints', AuthFactory.getAuth('User').id);
				if(AuthFactory.getAuth('User').currentRoom) {
					$rootScope.isChatroomAccess = true;
				}
			}
			$scope.isFolded = isNeedFoldCache = isNeedFoldCurrent =  $window.document.documentElement.offsetWidth < minWindowSize ? true : false;

			$scope.toggleNavbar = function () {
				if(isNeedFoldCurrent) {
					$scope.isFolded = !$scope.isFolded;
				}else{
					$scope.isFolded = false;
				}
			}

			$window.onresize = function() {
				isNeedFoldCurrent = $window.document.documentElement.offsetWidth < 768 ? true : false
				if(isNeedFoldCache !== isNeedFoldCurrent) {
					$scope.isFolded = isNeedFoldCache = isNeedFoldCurrent;
					$scope.$apply();
				}
			}

			socket.on('update hints',function (id) {
				if(AuthFactory.getAuth('User') && AuthFactory.getAuth('User').id === id) {
					HintFactory.getHintsCount(AuthFactory.getAuth('User').id + '/' + false, function (data) {
						$rootScope.totalHints = data.total;
					}, function (error) {
						console.log(error);
					});
				}
			});
		}])
		.controller('LoginController', ['$scope','$rootScope', 'AuthFactory', 'socket', function ($scope, $rootScope, AuthFactory, socket){
			
			AuthFactory.checkNotAuth('User');

			$scope.toggleSignin = function () {
				$rootScope.isSignin = !$rootScope.isSignin;
			}

			$scope.login = function () {
				if($scope.loginEmail && $scope.loginPassword) {

					AuthFactory.login({
						email: $scope.loginEmail, 
						password: $scope.loginPassword
					},function (data) {
						if(data.status.code === 404) {
							AuthFactory.checkAuth('User');
							$scope.loginEmail = data.data.email;
							$scope.loginPassword = data.data.password;
							console.log(data.status);
						}else if(data.status.code === 409) {
							AuthFactory.checkAuth('User');
							$scope.loginEmail = data.data.email;
							$scope.loginPassword = data.data.password;
							console.log(data.status);
						}else if(data.status.code === 200){
							AuthFactory.setAuth('User',data.data);
		 					$rootScope.isAuth = AuthFactory.checkAuth('User');
							$rootScope.isChatroomAccess = false;
							socket.emit('update hints', AuthFactory.getAuth('User').id);
							socket.emit('update friends', AuthFactory.getAuth('User').id);
		 					AuthFactory.checkNotAuth('User');
		 					console.log(data.status)
						}
					},function(error) {
						console.log(error);
					});
				}
			}

		}])
		.controller('SigninController', ['$scope', '$rootScope', 'AuthFactory', 'socket', function ($scope, $rootScope, AuthFactory, socket){
			
			AuthFactory.checkAuth('User');

			$scope.$watchGroup(['signinPassword','signinConfiration'], function (newVal) {
				$scope.isMatch = newVal[0] === newVal[1];
			});

			$scope.signin = function () {

				AuthFactory.signin({
					username: $scope.signinUsername,
					password: $scope.signinPassword,
					email: $scope.signinEmail,
					signature: $scope.signinSignature
				},function (data) {
					if(data.status.code === 409) {
						AuthFactory.checkAuth('User');
						$scope.signinUsername = data.data.username;
						$scope.signinPassword = data.data.password;
						$scope.signinEmail = data.data.email;
						$scope.signinSignature = data.data.signature;
						console.log(data.status);
					}else if(data.status.code === 200){
						AuthFactory.setAuth('User',data.data);
						$rootScope.isAuth = AuthFactory.checkAuth('User');
						$rootScope.isChatroomAccess = false;
						AuthFactory.checkNotAuth('User');
						console.log(data.status);
					}
				},function (error) {
					console.log(error);
				});
			}

		}])
		.controller('LogoutController', ['$scope','$rootScope','socket', 'AuthFactory','RoomFactory', function ($scope, $rootScope, socket, AuthFactory, RoomFactory){
			
			AuthFactory.checkAuth('User');
			$scope.logout = function () {
				var user = AuthFactory.getAuth('User');
				if(user.currentRoom) {
					RoomFactory.exit({
						userId: user.id
					}, function (data) {
						socket.emit('update room info', user.currentRoom);
					}, function (error) {

					});
				}
				AuthFactory.logout({
					id: user.id
				}, function (data) {
					socket.emit('update friends',user.id);
				}, function (error) {
					console.log(error);
				});

				$rootScope.isAuth = false;
				$rootScope.username = null;
				$rootScope.totalHints = 0;
				AuthFactory.removeAuth('User');
				AuthFactory.checkAuth('User');
			}
		}])
		.controller('UserInfoController',['$scope', '$rootScope', 'socket', 'AuthFactory','FriendFactory', function ($scope, $rootScope, socket, AuthFactory, FriendFactory) {
			
			if(AuthFactory.checkAuth('User')) {

				FriendFactory.getOne(AuthFactory.getAuth('User').id, function (data) {
					$rootScope.username = data.username;
					$scope.signature = data.signature;
				}, function (error) {
					console.log(error);
				});



			}
		}])
		.controller('ChatController', ['$scope', '$rootScope', '$timeout','$location', '$window', 'socket', 'AuthFactory','FriendFactory','RoomFactory', function ($scope, $rootScope, $timeout, $location, $window, socket, AuthFactory, FriendFactory, RoomFactory) {
			AuthFactory.checkAuth('User');
			RoomFactory.checkAccess('User');

			if(RoomFactory.checkAccess('User')) {

				socket.emit('update room info',AuthFactory.getAuth('User').currentRoom);
			}

			var minWindowSize = 768;
			$scope.isShowRoomInfo = $window.document.documentElement.offsetWidth < minWindowSize ? false : true;

			$scope.message = [];
			var timer;

			$scope.convertIdToUsername = function (input, data){
					
				if(AuthFactory.checkAuth('User') && input) {

					if(input === AuthFactory.getAuth('User').id) {
						return AuthFactory.getAuth('User').username;
					}else{

						var friends = data || [];
						var length = friends.length;

						for(var i=0; i<length;i++) {
							if(input === friends[i]['_id']) {
								return friends[i]['username'];
							}
						}
					}
				}
			}
			function updateRoom() {
				RoomFactory.getOne(AuthFactory.getAuth('User').currentRoom, function (room) {
					$scope.room = room;
					console.log(room);
				}, function (error) {
					console.log(error);	
				});
			}

			socket.on('update room info', function (id) {
				if(AuthFactory.getAuth('User') && id === AuthFactory.getAuth('User').currentRoom) {
					updateRoom();
				}
			})

			$scope.sendMessage = function(content) {
				if(content && AuthFactory.getAuth('User').currentRoom) {
					socket.emit('send message',{
						username: AuthFactory.getAuth('User').username,
						id: AuthFactory.getAuth('User').id,
						message: content,
						date: moment().format('HH:mm:ss'),
						currentRoom: AuthFactory.getAuth('User').currentRoom
					});
					$scope.content = '';
				}
			}

			$scope.typing = function () {
				socket.emit('typing', AuthFactory.getAuth('User').username);
			}

			socket.on('receive message', function (data) {
				if($scope.room.members.indexOf(data.id) >= 0 && data.currentRoom == AuthFactory.getAuth('User').currentRoom) {
					if(checkSelf(data)) {
						data.isSelf = checkSelf(data);
						$scope.message.push(data);
					}
					if(checkFriends(data)) {
						$scope.message.push(data);						
					}
				}
			});

			socket.on('typing', function (username) {

				$scope.typingUsername = username;
				if(timer){
					$timeout.cancel(timer);
				}
				timer = $timeout(function(){
					$scope.isTyping = false;
				},350);
				$scope.isTyping = true;					
			});

			function checkSelf(data) {
				return data.id == AuthFactory.getAuth('User').id ? true : false;
			}

			function checkFriends(data) {
				var friends = AuthFactory.getAuth('User').friends;
				if(friends && friends.length) {
					return friends.indexOf(data.id) >= 0 ? true : false ;
				}
			}


			FriendFactory.getAll(AuthFactory.getAuth('User').id, function (data) {
				$scope.friends = data;
			}, function (error) {
				console.log(error);
			});

			$scope.exit = function() {
				RoomFactory.exit({
					userId: AuthFactory.getAuth('User').id
				}, function (data) {
					socket.emit('update room info',AuthFactory.getAuth('User').currentRoom);
					console.log('exit success');
					$rootScope.isChatroomAccess = false;
					$location.path('/circle');
					$rootScope.currentRoom = '';
				}, function (error) {
					console.log(error);
				});
			}
		}])
		.controller('SearchFriendController', ['$scope', 'socket', 'AuthFactory', 'SearchFactory','HintFactory', function ($scope, socket, AuthFactory, SearchFactory, HintFactory) {
			
			AuthFactory.checkAuth('User');

			$scope.friends = AuthFactory.getAuth('User').friends;
			$scope.selfId = AuthFactory.getAuth('User').id;
			$scope.searchFriendContent = '';
			$scope.noSearchResult = false;
			$scope.isApplied = false;
			$scope.searchResult = null;

			$scope.search = function() {

				SearchFactory.searchUser({
					content:$scope.searchFriendContent
				}, function (data) {
					if(data.data && data.data.length) {
						$scope.searchResult = data.data;
						$scope.noSearchResult = false;
					}else{
						$scope.searchResult = null;
						$scope.noSearchResult = true;
					}
				}, function (error) {
					console.log(error);
				});
				$scope.searchFriendContent = '';
			}

			$scope.pullRequest = function(targetId, hintContent) {
				var self = this;
				if(targetId !== AuthFactory.getAuth('User').id) {
					
					HintFactory.pullRequest({
						targetId: targetId,
						hintType: 'friend request',
						hintContent: hintContent,
						senderId: AuthFactory.getAuth('User').id,
						senderName: AuthFactory.getAuth('User').username,
						mark: false,
						accept: false
					}, function (data) {
						socket.emit('update hints',targetId);
						self.isApplied = true;
						self.applyContent = '';
					}, function (error) {
						console.log(error);
					});
				}
			}
		}])
		.controller('HintController', ['$scope', '$rootScope','socket', 'AuthFactory', 'HintFactory','FriendFactory', function ($scope, $rootScope, socket, AuthFactory, HintFactory, FriendFactory){
			
			AuthFactory.checkAuth('User');

			$scope.isMarked = false;
			$scope.isAccepted = false;
			$scope.friends = AuthFactory.getAuth('User').friends;

			HintFactory.getAllHints(AuthFactory.getAuth('User').id, function(data) {
				$scope.hintsList = data.hints;
			}, function (error) {
				console.log(error);
			});

			$scope.mark = function(id) {
				var self = this;
				HintFactory.markHint({
					targetId: AuthFactory.getAuth('User').id,
					id: id
				}, function (data) {
					self.isMarked = true;
					$rootScope.totalHints = $rootScope.totalHints - 1;
				}, function (error) {
					console.log(error);
				});
			}
			$scope.accept = function(id) {
				var self = this;
				HintFactory.acceptHint({
					targetId: AuthFactory.getAuth('User').id,
					id: id
				}, function (hint) {
					if(!hint.mark) {
						self.isMarked = true;
						$rootScope.totalHints = $rootScope.totalHints - 1;
					}
					addFriend(hint.targetId,hint.senderId);
					self.isAccepted = true;
				}, function (error) {
					console.log(error);
				});
			}

			function addFriend(targetId,senderId) {

				FriendFactory.toBeFriends({
					targetId: targetId,
					senderId: senderId
				}, function (data) {

					FriendFactory.getOne(AuthFactory.getAuth('User').id, function (data) {
						AuthFactory.setAuth('User', data);
						
						HintFactory.pullRequest({
							targetId: senderId,
							hintType: 'accept request',
							hintContent: 'i accept your request , we are friend now .',
							senderId: AuthFactory.getAuth('User').id,
							senderName: AuthFactory.getAuth('User').username,
							mark: false,
							accept: true
						}, function (data) {

							socket.emit('update hints', senderId);
							socket.emit('update friends',AuthFactory.getAuth('User').id);
						
						}, function (error) {
							console.log(error);
						});
					}, function (error) {
						console.log(error);
					});
						
				}, function (error) {
					console.log(error);
				});
				

			}

		}])
		.controller('CircleController', ['$scope', '$rootScope', '$location', '$window','socket', 'AuthFactory','HintFactory','FriendFactory', 'NewsFactory','RoomFactory', function ($scope, $rootScope, $location, $window, socket, AuthFactory, HintFactory, FriendFactory, NewsFactory, RoomFactory){
			
			if(AuthFactory.checkAuth('User')) {
				FriendFactory.getOne(AuthFactory.getAuth('User').id, function (data) {
					AuthFactory.setAuth('User', data);
				}, function (error) {
					console.log(error);
				});


				updateRooms();
				updateFriends();
				updateNews();

				$rootScope.currentRoom = AuthFactory.getAuth('User').currentRoom;

				$scope.isCreateRoom = false;
				$scope.isChecked = false;
				$scope.members = [];
				$scope.writeContent = '';
				$scope.selfId = AuthFactory.getAuth('User').id;
				$scope.page = 1;


				var minWindowSize = 768;
				$scope.isShowSelfInfo = $scope.isShowFriends = $scope.isShowRooms = $window.document.documentElement.offsetWidth < minWindowSize ? false : true;
				
				$scope.convertIdToUsername = function (input, data){
					
					if(AuthFactory.checkAuth('User') && input) {

						if(input === AuthFactory.getAuth('User').id) {
							return AuthFactory.getAuth('User').username;
						}else{

							var friends = data || [];
							var length = friends.length;

							for(var i=0; i<length;i++) {
								if(input === friends[i]['_id']) {
									return friends[i]['username'];
								}
							}
						}
					}
				}

				function updateNews(page){
					NewsFactory.getAll(AuthFactory.getAuth('User').id + '/' + page, function (data) {
						$scope.newsList = data;
					}, function (error) {
						console.log(error);
					});
				}

				socket.on('update news',function (id) {
					if(AuthFactory.checkAuth('User')) {
						var user = AuthFactory.getAuth('User');
						if(user.id === id || user.friends.indexOf(id) >= 0) {
							updateNews($scope.page);
						}
					}
				});

				$scope.hasNext = true;
				$scope.loadNextPage = function () {
					if($scope.newsList && $scope.newsList.length < $scope.page * 7) {
						$scope.hasNext = false;

					}else{
						$scope.hasNext = true;
						$scope.page = $scope.page + 1;
						updateNews($scope.page);
						console.log($scope.page);
					}
				}

				function updateFriends(){
					FriendFactory.getAll(AuthFactory.getAuth('User').id, function (data) {
						$scope.friends = data;
					}, function (error) {
						console.log(error);
					});
				}

				socket.on('update friends',function(id){
					if(AuthFactory.checkAuth('User')) {
						var user = AuthFactory.getAuth('User');
						if(user.id === id || user.friends.indexOf(id) >= 0) {
							updateFriends();
						}
					}
				});
				function updateRooms(){
					RoomFactory.getRooms(AuthFactory.getAuth('User').id, function (rooms) {
						$scope.rooms = rooms;
					}, function (error) {
						console.log(error);
					});
				}
				socket.on('update rooms', function (members) {
					if(members.indexOf(AuthFactory.getAuth('User').id) >= 0) {
						updateRooms();
					}
				});

				function updateSelf(){
					FriendFactory.getOne(AuthFactory.getAuth('User').id, function (data) {
						$rootScope.username = data.username;
						$rootScope.signature = data.signature;
						console.log($rootScope.username,$rootScope.signature);
					}, function (error) {
						console.log(error);
					});
				}
				$scope.toggleCheck = function (id) {
					if($scope.members.indexOf(id) >= 0) {
						var index = $scope.members.indexOf(id);
						$scope.members.splice(index,1);
						this.isChecked = false;
					}else{
						$scope.members.push(id);
						this.isChecked = true;
					}
				}


				$scope.finish = function () {
					$scope.members.push(AuthFactory.getAuth('User').id);
					RoomFactory.create({
						roomInfo: $scope.roomInfo,
						createrId: AuthFactory.getAuth('User').id,
						createdDate: new Date(),
						members: $scope.members,
						currentMembers: []
					}, function (room) {
						socket.emit('update rooms',room.members);
						$scope.roomInfo = '';
						$scope.members = [];
						$scope.isCreateRoom = false;
					}, function (error) {
						console.log(error);
					});
				}
				$scope.join = function (roomId) {

					console.log(roomId);
					RoomFactory.join({
						userId: AuthFactory.getAuth('User').id,
						roomId: roomId
					}, function (data) {

						FriendFactory.getOne(AuthFactory.getAuth('User').id, function (data) {
							AuthFactory.setAuth('User',data);
							$rootScope.isChatroomAccess = true;
							$rootScope.currentRoom = roomId;
							$location.path('/chatroom');
							
						}, function (error) {
							console.log(error);
						});
					}, function (error) {
						console.log(error);
					});
					
				}

				$scope.isMarkdown = false;
		
				$scope.publish = function(){
					NewsFactory.create({
						publishId: AuthFactory.getAuth('User').id,
						publishContent: $scope.writeContent,
						isMarkdown: $scope.isMarkdown
					}, function (data) {
						socket.emit('update news',AuthFactory.getAuth('User').id);
						$scope.writeContent = '';
					}, function (error) {
						console.log(error);
					})
					$scope.isMarkdown = false;
				}


				$scope.isEdit = false;

				$scope.toggleEdit = function (newsId,newsContent) {
					if(this.isEdit === false) {
						this.isEdit = true;
					}else{
						this.isEdit = false;
					}
				}


				$scope.saveNews = function (newsId) {
					this.isEdit = false;

					NewsFactory.save({
						newsId: newsId,
						publishContent: this.editContentResult
					}, function (data) {
						socket.emit('update news', AuthFactory.getAuth('User').id);
					}, function (error) {
						console.log(error);
					});
				}
				$scope.removeNews = function (newsId) {
					NewsFactory.remove({
						newsId: newsId
					}, function (data) {
						socket.emit('update news', AuthFactory.getAuth('User').id);
					}, function (error) {
						console.log(error);
					});
				}

				$scope.supportNews = function (newsId) {
					NewsFactory.support({
						newsId: newsId,
						supporter: AuthFactory.getAuth('User').id
					}, function (data) {
						console.log($scope.newsList);
						socket.emit('update news', AuthFactory.getAuth('User').id);
					}, function (error) {
						console.log(error);
					});
				}

				$scope.saveUserInfo = function (username,signature) {
					this.isEdit = false;

					FriendFactory.save({
						userId: AuthFactory.getAuth('User').id,
						username: username,
						signature: signature
					}, function (user) {
						
						var temp = AuthFactory.getAuth('User');
						temp.username = user.username;
						temp.signature = user.signature;
						AuthFactory.setAuth('User', temp);

						$rootScope.username = data.user.username;

						socket.emit('update friends', AuthFactory.getAuth('User').id);
					}, function (error) {
						console.log(error);
					});
				}
			}
		}])
		
})();

