(function() {

	app
		.controller('FoldController', ['$scope', function ($scope){
			$scope.isFolded = true;
		}])
		.controller('LoginController', ['$scope','$http','$rootScope','$location', function ($scope, $http, $rootScope, $location){

			$scope.toggleSignin = function () {
				$rootScope.isSignin = !$rootScope.isSignin;
			}

			$scope.login = function (email, password) {

				$http.post("http://localhost:3000/login",{
					email: email,
					password: password
				}).success(function (data, status) {
				
					console.log(data,status);

					$location.path('/chatroom')
				}).error(function (data, status) {
					console.log(data,status);
				});
			}
		}])
		.controller('SigninController', ['$scope','$http','$rootScope','$location', function ($scope, $http, $rootScope, $location){
					
			$rootScope.isSignin = true;

			$scope.$watchGroup(['signinPassword','signinConfiration'], function (newVal) {
				$scope.isMatch = newVal[0] === newVal[1];
				console.log(newVal,$scope.isMatch);
			});

			$scope.signin = function (username, password, confiration, email, message) {

				$http.post("http://localhost:3000/register", {
					username: username,
					password: password,
					confiration: confiration,
					email: email,
					message: message
				}).success(function (data,status) {
					console.log(data,status);
				}).error(function (data,status) {
					console.log(data,status);
				})

				$location.path('/chatroom');

			}

		}])

})();
