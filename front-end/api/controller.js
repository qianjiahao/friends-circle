(function() {

	app
		.controller('NavbarController', ['$scope','$rootScope', '$location','$window','AuthFactory', function ($scope, $rootScope, $location, $window, AuthFactory){

			/*
				policy control .
			 */
			$rootScope.isAuth = AuthFactory.checkAuth('User');


			/*
				[isNeedFoldCurrent] : save the current the boolean if window need fold or not , 
				[isNeedFoldCache] : save the last value of boolean , if value change and then apply the viewmodel ,
				[minWindowSize] : the boundary value of the navbar hide or show .
			 */
			var isNeedFoldCurrent, isNeedFoldCache, minWindowSize = 768;


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

			/*
				[isActive] check the item which is active , add the active class .
			 */
			$scope.isActive = function (viewLocation) {
			     var active = (viewLocation === $location.path());
			     return active;
			};


		}])
		.controller('LoginController', ['$scope','$rootScope', '$location', 'AuthFactory', function ($scope, $rootScope, $location, AuthFactory){
			/*
				check not authentication .
			 */
			AuthFactory.checkNotAuth('User');

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
	 					$rootScope.username = AuthFactory.getAuth('User');
	 					$location.path('/chatroom');
	 					console.log(data)
					}
				},function(error,status) {
					console.log(error,status);
				});
			}

		}])
		.controller('SigninController', ['$scope', '$rootScope', '$location', 'AuthFactory', function ($scope, $rootScope, $location, AuthFactory){
			
			/*
				check authentication .
			 */
			AuthFactory.checkAuth('User');

			/*
				[isSignin] show or hide sign in content .
			 */
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
						$rootScope.username = AuthFactory.getAuth('User');
						$location.path('/chatroom');
						console.log(data);
					}
				},function (error, status) {
					console.log(data,status);
				});
			}

		}])
		.controller('LogoutController', ['$scope','$rootScope','AuthFactory', function ($scope, $rootScope, AuthFactory){
			
			/*
				{logout} logout the system .
			 */
			$scope.logout = function () {
				AuthFactory.removeAuth('User');
				$rootScope.isAuth = AuthFactory.checkAuth('User');
				$rootScope.username = null;
			}
		}])
		.controller('UserInfoController',['$scope', '$rootScope', 'AuthFactory','socket' ,function ($scope, $rootScope, AuthFactory, socket) {
			
			/*
				[username] , [signature] show username and user signature .
			 */
			var user = AuthFactory.getAuth('User');
			if(user) {
				$rootScope.username = user.username;
				$scope.signature = user.signature;
			}
			/*
				[isHint] flag there is hint or not .	
			 */
			$scope.isHint = false;
			$scope.hintCount = 0;
			/*
				subscribe the hint by socket.io .
			 */
			socket.on('hint',function (id) {
				if(AuthFactory.getAuth('User').id === id) {
					$scope.isHint = true;
					$scope.hintCount ++ ;
				}
			})


		}])
		.controller('ChatController', ['$scope', '$http', 'socket', 'AuthFactory', function ($scope, $http, socket, AuthFactory) {
			if(AuthFactory.checkAuth('User')) {

				/*
					[message] contain chatroom message .	
				 */
				$scope.message = [];

				/*
					[room] type of chatroom .
				 */
				$scope.room = '公共频道';

				/*
					{sendMessage} send message to server by socket.io .
				 */
				$scope.sendMessage = function(data) {
					socket.emit('send message',{
						username: AuthFactory.getAuth('User').username,
						message: $scope.content,
						date: moment().format('HH:mm:ss')
					});
					$scope.content = '';
				}

				/*
					{receive message} receive message from server .
				 */
				socket.on('receive message', function (data) {
					var isSelf = data.username === AuthFactory.getAuth('User').username ? true : false ;
					data.isSelf = isSelf;
					$scope.message.push(data);
					var len = $scope.message.length;
					if(len >= 100) {
						$scope.message = $scope.message.slice(len/4);

					}
				});

				$scope.isCreate = false;

				$scope.createRoom = function(){

				}
			}

		}])
		.controller('SearchFriendController', ['$scope', '$http', 'AuthFactory', 'socket', function ($scope, $http, AuthFactory, socket) {
			
			/*
				[searchFriendContent] search bar content .
			 */
			$scope.searchFriendContent = '';

			/*
				[noSearchResult] flag no search result .
			 */
			$scope.noSearchResult = false;

			/*
				{search} search friends by email or nickname .
			 */
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
			$scope.applyFor = function(id){

				 $http.post('http://localhost:3000/hint', {
				 	targetId: id,
				 	hintType: 'apply for',
				 	hintContent: '',
				 	senderId: AuthFactory.getAuth('User').id
				 }).success(function (data) {
				 	socket.emit('hint',data.data.targetId);
				 }).error(function (error) {
				 	console.log(error);
				});
			}
			
		}])

})();

