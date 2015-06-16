(function() {

	app
		.controller('BodyController', ['$rootScope', function ($rootScope){
			
			$rootScope.hintChanged = false;
			$rootScope.totalHints = 0;
			$rootScope.isSignin = false;


		}])
		.controller('NavbarController', ['$scope','$rootScope','$window','socket','AuthFactory','HintFactory', function ($scope, $rootScope, $window, socket, AuthFactory, HintFactory){

			var isNeedFoldCurrent,
				isNeedFoldCache,
				minWindowSize = 768;

			$rootScope.isAuth = AuthFactory.checkAuth('User');
			if(AuthFactory.checkAuth('User')) {
				$rootScope.username = AuthFactory.getAuth('User').username;
			}
			$scope.isFolded = isNeedFoldCache = isNeedFoldCurrent =  $window.document.documentElement.offsetWidth <= minWindowSize ? true : false;

			$scope.toggleNavbar = function () {
				if(isNeedFoldCurrent) {
					$scope.isFolded = !$scope.isFolded;
				}else{
					$scope.isFolded = false;
				}
			}

			$window.onresize = function() {
				isNeedFoldCurrent = $window.document.documentElement.offsetWidth <= 768 ? true : false
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
			
			$scope.$watch('hintChanged', function(newValue) {
				if(AuthFactory.checkAuth('User')) {
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

				AuthFactory.login({
					email: $scope.loginEmail, password: $scope.loginPassword
				},function(data,status) {
					if(data.status === 'error') {
						AuthFactory.checkAuth('User');
						$scope.loginEmail = data.data.email;
						$scope.loginPassword = data.data.password;
						console.log(data.message);
					}else{
						AuthFactory.setAuth('User',data.data);
	 					$rootScope.isAuth = AuthFactory.checkAuth('User');
	 					$rootScope.username = AuthFactory.getAuth('User').username;
						$rootScope.hintChanged = !$rootScope.hintChanged;
	 					AuthFactory.checkNotAuth('User');
	 					console.log(data)
					}
				},function(error,status) {
					console.log(error,status);
				});
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
				},function (data, status) {
					if(data.status === 'error') {
						AuthFactory.checkAuth('User');
						$scope.signinUsername = data.data.username;
						$scope.signinPassword = data.data.password;
						$scope.signinEmail = data.data.email;
						$scope.signinSignature = data.data.signature;
						console.log(data.message);
					}else{
						AuthFactory.setAuth('User',data.data);
						$rootScope.isAuth = AuthFactory.checkAuth('User');
						$rootScope.username = AuthFactory.getAuth('User').username;
						AuthFactory.checkNotAuth('User');
						console.log(data);
					}
				},function (error, status) {
					console.log(data,status);
				});
			}

		}])
		.controller('LogoutController', ['$scope','$rootScope', 'AuthFactory','socket', function ($scope, $rootScope, AuthFactory, socket){
			
			AuthFactory.checkAuth('User');

			$scope.logout = function () {
				AuthFactory.logout({
					id: AuthFactory.getAuth('User').id
				}, function (data) {

					socket.emit('update friends',AuthFactory.getAuth('User').id);

				}, function (error) {
					console.log(error);
				});
				AuthFactory.removeAuth('User');
				$rootScope.isAuth = AuthFactory.checkAuth('User');
				$rootScope.username = null;
				$rootScope.totalHints = 0;
			}
		}])
		.controller('UserInfoController',['$scope', '$rootScope', 'socket', 'AuthFactory', function ($scope, $rootScope, socket, AuthFactory) {
			
			AuthFactory.checkAuth('User');

			if(AuthFactory.checkAuth('User')) {
				$scope.signature = AuthFactory.getAuth('User').signature;
			}

		}])
		.controller('ChatController', ['$scope', '$rootScope', '$timeout', 'socket', 'AuthFactory','FriendFactory','RoomFactory', function ($scope, $rootScope, $timeout, socket, AuthFactory, FriendFactory, RoomFactory) {
			AuthFactory.checkAuth('User');
			
			if(AuthFactory.checkJoinRoom('User')) {
				console.log(AuthFactory.getAuth('User'));
				updateRoom();

				$scope.message = [];

				var timer;

				function updateRoom() {
					RoomFactory.getOne(AuthFactory.getAuth('User').currentRoom, function (data) {
						$scope.room = data.room;
					}, function (error) {
						console.log(error);	
					});
				}

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

					$scope.convertIdToUsername = function (input){
						var friends = data
						var length = friends.length;
						for(var i=0; i<length;i++) {
							if(input === friends[i]['_id']) {
								return friends[i]['username'];
							}
							if(AuthFactory.getAuth('User') && input === AuthFactory.getAuth('User').id) {
								return AuthFactory.getAuth('User').username;
							}
						}

					}
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
						socket.emit('update hints',data.targetId);
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
				}, function (data) {
					if(!data.hint.mark) {
						self.isMarked = true;
						$rootScope.totalHints = $rootScope.totalHints - 1;
					}
					addFriend(data.hint.targetId,data.hint.senderId);
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
						
						socket.emit('update hints', senderId);
						socket.emit('update friends',AuthFactory.getAuth('User').id);
						
						HintFactory.pullRequest({
							targetId: senderId,
							hintType: 'accept request',
							hintContent: 'i accept your request , we are friend now .',
							senderId: AuthFactory.getAuth('User').id,
							senderName: AuthFactory.getAuth('User').username,
							mark: false,
							accept: true
						}, function (data) {

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
		.controller('CircleController', ['$scope', '$rootScope', '$location', 'socket', 'AuthFactory','HintFactory','FriendFactory', 'NewsFactory','RoomFactory', function ($scope, $rootScope, $location, socket, AuthFactory, HintFactory, FriendFactory, NewsFactory, RoomFactory){
			
			if(AuthFactory.checkAuth('User')) {
				FriendFactory.getOne(AuthFactory.getAuth('User').id, function (data) {
					AuthFactory.setAuth('User', data);
				}, function (error) {
					console.log(error);
				});
				$scope.isCreateRoom = false;
				$scope.isChecked = false;
				$scope.members = [];
				$scope.writeContent = '';

				socket.emit('update friends',AuthFactory.getAuth('User').id);
				socket.emit('update news',AuthFactory.getAuth('User').id);
				socket.emit('update rooms',AuthFactory.getAuth('User').id);

				$scope.convertIdToUsername = function (input){
					var friends = $scope.friends;
					for(var i=0,length=friends.length; i<length;i++) {
						if(input === friends[i]['_id']) {
							return friends[i]['username'];
						}
						if(AuthFactory.getAuth('User') && input === AuthFactory.getAuth('User').id) {
							return AuthFactory.getAuth('User').username;
						}
					}
				}

				function updateNews(){
					NewsFactory.getAll(AuthFactory.getAuth('User').id, function (data) {
						$scope.newsList = data;
					}, function (error) {
						console.log(error);
					});
				}

				socket.on('update news',function (id) {
					if(AuthFactory.checkAuth('User')) {
						var user = AuthFactory.getAuth('User');
						if(user.id === id || user.friends.indexOf(id) >= 0) {
							updateNews();
						}
					}
				});
				
				$scope.publish = function(){
					NewsFactory.create({
						publishId: AuthFactory.getAuth('User').id,
						publishContent: $scope.writeContent
					}, function (data) {
						socket.emit('update news',AuthFactory.getAuth('User').id);
						$scope.writeContent = '';
					}, function (error) {
						console.log(error);
					})
				}

				function updateFriends(callback){
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
				$scope.finish = function (roomInfo) {
					$scope.members.push(AuthFactory.getAuth('User').id);
					RoomFactory.create({
						roomInfo: roomInfo,
						createrId: AuthFactory.getAuth('User').id,
						createdDate: new Date(),
						members: $scope.members,
						currentMembers: []
					}, function (data) {
						socket.emit('update rooms',data.room.members);
						$scope.roomInfo = '';
						$scope.members = [];
						$scope.isCreateRoom = false;
					}, function (error) {
						console.log(error);
					});
				}
				function updateRoom(){
					RoomFactory.getRooms(AuthFactory.getAuth('User').id, function (data) {
						$scope.rooms = data.rooms;
					}, function (error) {
						console.log(error);
					});
				}
				socket.on('update rooms', function (members) {
					if(members.indexOf(AuthFactory.getAuth('User').id) >= 0) {
						updateRoom();
					}
				});
				$scope.join = function (roomId) {

					RoomFactory.join({
						userId: AuthFactory.getAuth('User').id,
						roomId: roomId
					}, function (data) {

						updateFriends();
						console.log('join success');
						$location.path('/chatroom');

					}, function (error) {
						console.log(error);
					});
				}
			}

		}])
		
})();

