(function() {

	app
		.controller('NavbarController', ['$scope','$rootScope', '$location','$window', function ($scope, $rootScope, $location, $window){

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

			$scope.brand = 'friends';

			$scope.toggleBrand = function() {
				if($scope.brand == 'friends') {
					$scope.brand = 'circle';
				}else{
					$scope.brand = 'friends'
				}
			}
		}])
		.controller('LoginController', ['$scope','$rootScope','$location','$cookies','AuthFactory', function ($scope, $rootScope, $location, $cookies, AuthFactory){

			$scope.toggleSignin = function () {
				$rootScope.isSignin = !$rootScope.isSignin;
			}

			$scope.login = function (email, password) {

				AuthFactory.login({
					email: email, password: password
				},function(data,status) {
					var expires = new Date();
					    expires.setDate(expires.getDate() + 15);
					$cookies.putObject('User', data.data, {
						'expires': expires
					});
					$rootScope.isAuth = $cookies.get('User') ? true : false;
					$location.path('/chatroom');
				},function(error,status) {
					console.log(error,status);
				});
			}
		}])
		.controller('SigninController', ['$scope','$rootScope','$location','$cookies','AuthFactory', function ($scope, $rootScope, $location, $cookies, AuthFactory){
					
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
					var expires = new Date();
 				    expires.setDate(expires.getDate() + 15);
					$cookies.putObject('User', data.data, {
						'expires': expires
					});
					$rootScope.isAuth = $cookies.get('User') ? true : false;
					$location.path('/chatroom');
				},function (error, status) {
					console.log(data,status);
				});
			}

		}])
		.controller('LogoutController', ['$scope','$rootScope','$cookies', function ($scope, $rootScope, $cookies){
			
			$scope.logout = function () {
				$cookies.remove('User');
				$rootScope.isAuth = $cookies.get('User') ? true : false;

			}
		}])
		.controller('UserInfoController',['$scope','$cookies',function ($scope, $cookies) {

			var user =  $cookies.getObject('User');
			if(user) {
				$scope.username = user.username;
				$scope.message = user.message;
				console.log(user);
			}
		}])

})();
