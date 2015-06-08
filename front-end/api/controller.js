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
			$scope.login = function (email, password) {

				AuthFactory.login({
					email: email, password: password
				},function(data,status) {
					AuthFactory.setAuth('User',data.data);
 					$rootScope.isAuth = AuthFactory.getAuth('User');
 					$location.path('/chatroom')
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
			$scope.signin = function (username, password, confiration, email, message) {

				AuthFactory.signin({
					username: username,
					password: password,
					email: email,
					message: message
				},function (data, status) {
					AuthFactory.setAuth('User',data.data);
					$rootScope.isAuth = AuthFactory.getAuth('User');
					$location.path('/chatroom');
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
			}
		}])
		.controller('UserInfoController',['$scope', 'AuthFactory',function ($scope, AuthFactory) {
			
			/*
				[username] , [message] show username and user message .
			 */
			var user = AuthFactory.getAuth('User');
			if(user) {
				$scope.username = user.username;
				$scope.message = user.message;
			}
		}])
		.controller('ChatController', ['$scope', 'socket', 'AuthFactory', function ($scope, socket, AuthFactory) {
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

				
			}

		}])

})();

