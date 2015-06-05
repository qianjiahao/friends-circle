(function() {

	app
		.controller('ButtonController', ['$scope', function ($scope){
			$scope.isSignin = false;
			$scope.toggleSignin = function () {
				$scope.isSignin = !$scope.isSignin;
			}
		}])
		.controller('FoldController', ['$scope', function ($scope){
			$scope.isFolded = true;
		}])
		.controller('LoginController', ['$scope','$http', function ($scope, $http){


		}])
		.controller('SigninController', ['$scope','$http', function ($scope, $http){
			
		}])

})();
