(function() {

	app
		.controller('FoldController', ['$scope', function ($scope){
			$scope.isFolded = true;
		}])
		.controller('LoginController', ['$scope','$http','$rootScope', function ($scope, $http, $rootScope){

			$scope.toggleSignin = function () {
				$rootScope.isSignin = !$rootScope.isSignin;
			}

			$scope.login = function (email, password) {
				console.log(email,password);
				var obj = {
					email: email,
					password: password
				}

				$http.post("http://localhost:3000/login",obj)
				.success(function(data, status, headers, config) {
				
					console.log(data,status,headers);
				})
				.error(function(data, status, headers, config) {
					console.log(data,status,headers);
				});
			}
		}])
		.controller('SigninController', ['$scope','$http','$rootScope', function ($scope, $http, $rootScope){
					
			$rootScope.isSignin = false;
		}])

})();
