(function() {

	app
		.controller('NavbarController', ['$scope','$rootScope', '$location','$window','AuthFactory', function ($scope, $rootScope, $location, $window, AuthFactory){
			$rootScope.isAuth,
			$rootScope.totalHints,
			$scope.isFolded;

			/*
				[isNeedFoldCurrent] : save the current the boolean if window need fold or not , 
				[isNeedFoldCache] : save the last value of boolean , if value change and then apply the viewmodel ,
				[minWindowSize] : the boundary value of the navbar hide or show .
			 */
			var isNeedFoldCurrent,
				isNeedFoldCache,
				minWindowSize = 768;

			$rootScope.isAuth = AuthFactory.checkAuth('User');
			$rootScope.totalHints = 0;
			$scope.isFolded = isNeedFoldCache = isNeedFoldCurrent =  $window.document.documentElement.offsetWidth <= minWindowSize ? true : false;

			/*
				{toggleNavbar} toggle the navbar if the [windowSizeCurrent] less than 768 .
			 */
			$scope.toggleNavbar = function () {
				if(isNeedFoldCurrent) {
					$scope.isFolded = !$scope.isFolded;
				}else{
					$scope.isFolded = false;
				}
			}

			/*
				{onresize} when window was resized , check the cache and choose apply or not .
			 */
			$window.onresize = function() {
				isNeedFoldCurrent = $window.document.documentElement.offsetWidth <= 768 ? true : false
				if(isNeedFoldCache !== isNeedFoldCurrent) {
					$scope.isFolded = isNeedFoldCache = isNeedFoldCurrent;
					$scope.$apply();
				}

			}
		}])
		.controller('LoginController', ['$scope','$rootScope', '$location', '$http', 'AuthFactory', 'socket', function ($scope, $rootScope, $location, $http, AuthFactory, socket){
			
			AuthFactory.checkNotAuth('User');
			
			$rootScope.isSignin,
			$rootScope.hintChanged,
			$rootScope.username,
			$scope.loginEmail,
			$scope.loginPassword;


			/*
				{toggleSignin} toggle signin button .
			 */
			$scope.toggleSignin = function () {
				$rootScope.isSignin = !$rootScope.isSignin;
			}

			/*
				{login} login the system .
			 */
			$scope.login = function () {

				AuthFactory.login({
					email: $scope.loginEmail, password: $scope.loginPassword
				},function(data,status) {
					if(data.status === 'error') {
						$location.path('/auth');
						$scope.loginEmail = data.data.email;
						$scope.loginPassword = data.data.password;
						console.log(data.message);
					}else{
						AuthFactory.setAuth('User',data.data);
	 					$rootScope.isAuth = AuthFactory.checkAuth('User');
	 					$rootScope.username = AuthFactory.getAuth('User').username;
						$rootScope.hintChanged = !$rootScope.hintChanged;
	 					$location.path('/chatroom');
	 					console.log(data)
					}
				},function(error,status) {
					console.log(error,status);
				});
			}

		}])
		.controller('SigninController', ['$scope', '$rootScope', '$location', 'AuthFactory', 'socket', function ($scope, $rootScope, $location, AuthFactory, socket){
			
			AuthFactory.checkAuth('User');
			
			$rootScope.isSignin,
			$rootScope.isAuth,
			$rootScope.username,
			$rootScope.totalHints
			$scope.isMatch,
			$scope.signinUsername,
			$scope.signinPassword,
			$scope.signinEmail,
			$scope.signinSignature;


			$rootScope.isSignin = true;

			/*
				[isMatch] flag password and confiration match or not .
			 */
			$scope.$watchGroup(['signinPassword','signinConfiration'], function (newVal) {
				$scope.isMatch = newVal[0] === newVal[1];
			});

			/*
				{signin} sign in the system .
			 */
			$scope.signin = function () {

				AuthFactory.signin({
					username: $scope.signinUsername,
					password: $scope.signinPassword,
					email: $scope.signinEmail,
					signature: $scope.signinSignature
				},function (data, status) {
					if(data.status === 'error') {
						$location.path('/auth');
						$scope.signinUsername = data.data.username;
						$scope.signinPassword = data.data.password;
						$scope.signinEmail = data.data.email;
						$scope.signinSignature = data.data.signature;
						console.log(data.message);
					}else{
						AuthFactory.setAuth('User',data.data);
						$rootScope.isAuth = AuthFactory.checkAuth('User');
						$rootScope.username = AuthFactory.getAuth('User').username;
						$rootScope.totalHints = 0;
						$location.path('/chatroom');
						console.log(data);
					}
				},function (error, status) {
					console.log(data,status);
				});
			}

		}])
		.controller('LogoutController', ['$scope','$rootScope', '$http', 'AuthFactory','socket', function ($scope, $rootScope, $http, AuthFactory, socket){
			
			AuthFactory.checkAuth('User');

			$rootScope.isAuth,
			$rootScope.username,
			$rootScope.totalHints;

			/*
				{logout} logout the system .
			 */
			$scope.logout = function () {
				$http.post('http://localhost:3000/logout',{
					
						id: AuthFactory.getAuth('User').id
					
					}).success(function (data){

					}).error(function (error) {
						console.log(error);
					});
				socket.emit('update friends',AuthFactory.getAuth('User').id);
				AuthFactory.removeAuth('User');
				$rootScope.isAuth = AuthFactory.checkAuth('User');
				$rootScope.username = null;
				$rootScope.totalHints = 0;
			}
		}])
		.controller('UserInfoController',['$scope', '$rootScope', '$http', 'AuthFactory', 'socket' ,function ($scope, $rootScope, $http, AuthFactory, socket) {
			
			if(AuthFactory.checkAuth('User')) {

				$rootScope.username,
				$rootScope.hintChanged,
				$rootScope.totalHints,
				$scope.signature;

				$rootScope.hintChanged = false;
				$rootScope.hintChanged = !$rootScope.hintChanged;
				$rootScope.username = AuthFactory.getAuth('User').username;
				$scope.signature = AuthFactory.getAuth('User').signature;

				/*
					subscribe the hint by socket.io .
				 */
				socket.on('update hints',function (data) {
					if(AuthFactory.getAuth('User').id === data.targetId) {
						$rootScope.hintChanged = !$rootScope.hintChanged;
					}
				});

					
				$scope.$watch('hintChanged', function(newValue) {
					if(AuthFactory.checkAuth('User')) {
						$http.get('http://localhost:3000/hints/count/' + AuthFactory.getAuth('User').id + '/' + false)
							.success(function (data) {
								$rootScope.totalHints = data.total;
								console.log('total hints :' + data.total);
							}).error(function (error) {
								console.log(error);
							});
					}
				});
			}
			
		}])
		.controller('ChatController', ['$scope', '$http', 'socket', 'AuthFactory', function ($scope, $http, socket, AuthFactory) {
			AuthFactory.checkAuth('User');
			
			$http.get('http://localhost:3000/user/' + AuthFactory.getAuth('User').id)
				.success(function (data) {
					AuthFactory.setAuth('User', data);
				}).error(function (error) {
					console.log(error);
				});
			if(AuthFactory.checkJoinRoom('User')) {

				$http.get('http://localhost:3000/room/' + AuthFactory.getAuth('User').currentRoom)
					.success(function (data) {
						$scope.room = data.room;
					}).error(function (error) {
						console.log(error);
					});

				$scope.message,
				$scope.content;

				$scope.message = [];

				/*
					{sendMessage} send message to server by socket.io .
				 */
				$scope.sendMessage = function(content) {
					if(content && AuthFactory.getAuth('User').currentRoom) {
						socket.emit('send message',{
							username: AuthFactory.getAuth('User').username,
							id: AuthFactory.getAuth('User').id,
							message: content,
							date: moment().format('HH:mm:ss')
						});
						$scope.content = '';
					}
				}

				/*
					{receive message} receive message from server .
				 */
				socket.on('receive message', function (data) {
					if($scope.room.members.indexOf(data.id) >= 0) {

						if(checkSelf(data)) {
							data.isSelf = checkSelf(data);
							$scope.message.push(data);
						}
						if(checkFriends(data)) {
							$scope.message.push(data);						
						}
					}
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
			}
		}])
		.controller('SearchFriendController', ['$scope', '$http', 'AuthFactory', 'socket', function ($scope, $http, AuthFactory, socket) {
			
			AuthFactory.checkAuth('User');

			$scope.searchFriendContent,
			$scope.noSearchResult,
			$scope.selfId,
			$scope.isApplied,
			$scope.friends;

			$scope.isApplied = false;
			$scope.friends = AuthFactory.getAuth('User').friends;
			$scope.selfId = AuthFactory.getAuth('User').id;
			$scope.noSearchResult = false;
			$scope.searchFriendContent = '';

			$scope.search = function() {
				$scope.searchResult = null;

				$http.post('http://localhost:3000/search',{
					content:$scope.searchFriendContent
				}).success(function(data) {
					if(data.data && data.data.length) {
						$scope.searchResult = data.data;
						$scope.noSearchResult = false;
					}else{
						$scope.searchResult = null;
						$scope.noSearchResult = true;
					}
				}).error(function(error) {
					console.log(error);
				})
				$scope.searchFriendContent = '';

			}

			/*
				{applyFor} apply for other people to be friend .
			 */
			
			$scope.applyFor = function(targetId,hintContent){
				var self = this;
				if(targetId !== AuthFactory.getAuth('User').id) {

					$http.post('http://localhost:3000/hint', {
						targetId: targetId,
						hintType: 'friend request',
						hintContent: hintContent,
						senderId: AuthFactory.getAuth('User').id,
						senderName: AuthFactory.getAuth('User').username,
						mark: false,
						accept: false
					}).success(function (data) {
						
						socket.emit('update hints',data);
						self.isApplied = true;
						self.applyContent = '';
						
					}).error(function (error) {
						console.log(error);
					});

				}
			}
		}])
		.controller('HintController', ['$scope', '$http', '$location', '$rootScope', 'AuthFactory', 'socket', function ($scope, $http, $location, $rootScope, AuthFactory, socket){
			
			AuthFactory.checkAuth('User');

			$rootScope.totalHints,
			$scope.isMarked,
			$scope.hintsList,
			$scope.isAccepted,
			$scope.friends;

			$scope.isMarked = false;
			$scope.isAccepted = false;
			$scope.friends = AuthFactory.getAuth('User').friends;

			$http.get('http://localhost:3000/hints/all/'+ AuthFactory.getAuth('User').id)
				.success(function (data) {
					$scope.hintsList = data.hints;
				}).error(function (error) {
					console.log(error)
				});


			$scope.mark = function(id) {
				var self = this;
				$http.post('http://localhost:3000/hint/mark',{
					targetId: AuthFactory.getAuth('User').id,
					id: id
				}).success(function (data) {
					self.isMarked = true;
					modifyHint();
				}).error(function (error) {
					console.log(error);
				});
			}


			$scope.accept = function(id) {

				var self = this;

				$http.post('http://localhost:3000/hint/accept',{
					targetId: AuthFactory.getAuth('User').id,
					id: id
				}).success(function (data) {
					if(!data.hint.mark) {
						self.isMarked = true;
						modifyHint();
					}
					addFriend(data.hint.targetId,data.hint.senderId);
					self.isAccepted = true;
				}).error(function (error) {
					console.log(error);
				});
			}
			
			function modifyHint(){
				if($rootScope.totalHints) {
					$rootScope.totalHints -= 1;
				}
			}

			function addFriend(targetId,senderId) {

				$http.post('http://localhost:3000/friend/accept',{
					targetId: targetId,
					senderId: senderId
				}).success(function (date) {

				$http.get('http://localhost:3000/user/' + AuthFactory.getAuth('User').id)
					.success(function (data) {
						AuthFactory.setAuth('User', data);
					}).error(function (error) {
						console.log(error);
					})
					socket.emit('update friends',AuthFactory.getAuth('User').id);
					returnMessage(senderId,'i accept your request , we are friend now .');
				}).error(function (error) {
					console.log(error);
				})
			}

			function returnMessage(targetId,hintContent) {
				$http.post('http://localhost:3000/hint',{
					targetId: targetId,
					hintType: 'accept request',
					hintContent: hintContent,
					senderId: AuthFactory.getAuth('User').id,
					senderName: AuthFactory.getAuth('User').username,
					mark: false,
					accept: true
				}).success(function (data) {
					console.log(data);
					socket.emit('update hints',data);
				}).error(function (error) {
					console.log(error);
				});
			}
		}])
		.controller('CircleController', ['$scope', '$http', '$location', 'AuthFactory', 'socket', function ($scope, $http, $location, AuthFactory, socket){
			
			AuthFactory.checkAuth('User');

			$http.get('http://localhost:3000/user/' + AuthFactory.getAuth('User').id)
				.success(function (data) {
					AuthFactory.setAuth('User', data);
				}).error(function (error) {
					console.log(error);
				});
			

			$scope.newsList,
			$scope.writeContent,
			$scope.isCreateRoom,
			$scope.isChecked,
			$scope.members,
			$scope.roomInfo,
			$scope.rooms;

			$scope.isCreateRoom = false;
			$scope.isChecked = false;
			$scope.members = [];
			$scope.writeContent = '';


			socket.emit('update friends',AuthFactory.getAuth('User').id);
			socket.emit('update news',AuthFactory.getAuth('User').id);
			socket.emit('update rooms',AuthFactory.getAuth('User').id);

			function updateNews(){
				$http.get('http://localhost:3000/news/all/' + AuthFactory.getAuth('User').id)
					.success(function (data) {
						$scope.newsList = data;
					}).error(function (error) {
						console.log(error);
					});
			}
			function convertIdToUsername(friends,newsData){

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
				$http.post('http://localhost:3000/news/create',{
					publishId: AuthFactory.getAuth('User').id,
					publishContent: $scope.writeContent
				}).success(function (data) {

					socket.emit('update news',AuthFactory.getAuth('User').id);
					$scope.writeContent = '';

				}).error(function (error) {
					console.log(error);
				});
			}

			function updateFriends(){
				$http.get('http://localhost:3000/friends/all/' + AuthFactory.getAuth('User').id)
					.success(function (data) {
						$scope.friends = data;
					}).error(function (error) {
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
				$http.post('http://localhost:3000/room/create',{
					roomInfo: roomInfo,
					createrId: AuthFactory.getAuth('User').id,
					createdDate: new Date(),
					members: $scope.members,
					currentMembers: []
				}).success(function (data) {
					socket.emit('update rooms',data.room.members);
				}).error(function (error) {
					console.log(error);
				});
				$scope.roomInfo = '';
				$scope.members = [];
				$scope.isCreateRoom = false;

			}

			function updateRoom(){
				$http.get('http://localhost:3000/rooms/' + AuthFactory.getAuth('User').id)
					.success(function (data) {
						$scope.rooms = data.rooms;
					}).error(function (error) {
						console.log(error);
					});
			}

			socket.on('update rooms', function (members) {
				if(members.indexOf(AuthFactory.getAuth('User').id) >= 0) {
					updateRoom();
				}
			});

			$scope.join = function (roomId) {
				$http.post('http://localhost:3000/room/join',{
					roomId: roomId,
					userId: AuthFactory.getAuth('User').id
				}).success(function (data) {
					$location.path('/chatroom');
				}).error(function (error) {
					console.log(error);
				});
			}
		}])
		
})();

