(function() {

	app
		.controller('FoldController', ['$scope', function ($scope){
			$scope.isFolded = true;
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
