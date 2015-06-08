(function() {

	app
		.controller('NavbarController', ['$scope','$rootScope', '$location','$window','AuthFactory', function ($scope, $rootScope, $location, $window, AuthFactory){

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
				when window was resized , check the cache and choose apply or not .
			 */
			$window.onresize = function() {
				isNeedFoldCurrent = $window.document.documentElement.offsetWidth <= 768 ? true : false
				if(isNeedFoldCache !== isNeedFoldCurrent) {
					$scope.isFolded = isNeedFoldCache = isNeedFoldCurrent;
					$scope.$apply();
				}

			}

			/*
				check the item which is active , add the active class .
			 */
			$scope.isActive = function (viewLocation) {
			     var active = (viewLocation === $location.path());
			     return active;
			};


		}])
		.controller('LoginController', ['$scope','$rootScope', '$location', 'AuthFactory', function ($scope, $rootScope, $location, AuthFactory){
			AuthFactory.checkAuth('User');
			AuthFactory.checkNotAuth('User');

			$scope.toggleSignin = function () {
				$rootScope.isSignin = !$rootScope.isSignin;
			}

			$scope.login = function (email, password) {

				AuthFactory.login({
					email: email, password: password
				},function(data,status) {
					// var expires = new Date();
				    // expires.setDate(expires.getDate() + 15);
					
					AuthFactory.setAuth('User',data.data);
 					$rootScope.isAuth = AuthFactory.getAuth('User');
 					$location.path('/chatroom')
				},function(error,status) {
					console.log(error,status);
				});
			}

		}])
		.controller('SigninController', ['$scope', '$rootScope', '$location', 'AuthFactory', function ($scope, $rootScope, $location, AuthFactory){
			
			AuthFactory.checkAuth('User');

			$rootScope.isSignin = true;

			$scope.$watchGroup(['signinPassword','signinConfiration'], function (newVal) {
				$scope.isMatch = newVal[0] === newVal[1];
			});

			$scope.signin = function (username, password, confiration, email, message) {

				AuthFactory.signin({
					username: username,
					password: password,
					email: email,
					message: message
				},function (data, status) {
					// var expires = new Date();
 				    // expires.setDate(expires.getDate() + 15);
					
					AuthFactory.setAuth('User',data.data);
					$rootScope.isAuth = AuthFactory.getAuth('User');
					$location.path('/chatroom');
				},function (error, status) {
					console.log(data,status);
				});
			}

		}])
		.controller('LogoutController', ['$scope','$rootScope','AuthFactory', function ($scope, $rootScope, AuthFactory){
			
			$scope.logout = function () {
				AuthFactory.removeAuth('User');
				$rootScope.isAuth = AuthFactory.checkAuth('User');
			}
		}])
		.controller('UserInfoController',['$scope', 'AuthFactory',function ($scope, AuthFactory) {
			var user = AuthFactory.getAuth('User');
			if(user) {
				$scope.username = user.username;
				$scope.message = user.message;
			}
		}])
		.controller('ChatController', ['$scope', 'socket', 'AuthFactory', function ($scope, socket, AuthFactory) {
			if(AuthFactory.checkAuth('User')) {

				$scope.message = [];

				$scope.sendMessage = function(data) {
					socket.emit('send message',{
						username: AuthFactory.getAuth('User').username,
						message: $scope.content,
						date: moment().format('HH:mm:ss')
					});
					$scope.content = '';
				}

				socket.on('receive message', function (data) {
					$scope.message.push(data);
					console.log(data);
				});
			}

		}])

})();

