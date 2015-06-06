(function() {

	app
		.controller('FoldController', ['$scope', function ($scope){
			$scope.isFolded = true;
		}])
		.controller('LoginController', ['$scope','$http','$rootScope','$location','$cookies', function ($scope, $http, $rootScope, $location, $cookies){

			$scope.toggleSignin = function () {
				$rootScope.isSignin = !$rootScope.isSignin;
			}

			$scope.login = function (email, password) {

				$http.post("http://localhost:3000/login",{
					email: email,
					password: password
				}).success(function (data, status) {
 					
					var expires = new Date();
 				    expires.setDate(expires.getDate() + 15);
					$cookies.putObject('User', data.data, {
						'expires': expires
					});

					$location.path('/chatroom')
					console.log($cookies.getObject('User'));
				}).error(function (data, status) {
					console.log(data,status);
				});
			}
		}])
		.controller('SigninController', ['$scope','$http','$rootScope','$location','$cookies', function ($scope, $http, $rootScope, $location, $cookies){
					
			$rootScope.isSignin = true;

			$scope.$watchGroup(['signinPassword','signinConfiration'], function (newVal) {
				$scope.isMatch = newVal[0] === newVal[1];
			});

			$scope.signin = function (username, password, confiration, email, message) {

				if(password !== confiration) {
					$location.path('/index');
				}else{
					$http.post("http://localhost:3000/register", {
						username: username,
						password: password,
						email: email,
						message: message
					}).success(function (data,status) {

						var expires = new Date();
	 				    expires.setDate(expires.getDate() + 15);
						$cookies.putObject('User', data.data, {
							'expires': expires
						});

						$location.path('/chatroom');

					}).error(function (data,status) {
						console.log(data,status);
					})
				}
			}

		}])
		.controller('UserInfoController',['$scope','$cookies',function ($scope, $cookies) {

			var user =  $cookies.getObject('User');
			console.log(user);
			$scope.username = user.username || 'Nobody';
			$scope.message = user.message || 'Nothing';
		}])

})();
