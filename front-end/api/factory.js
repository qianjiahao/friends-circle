(function () {

	app
		.factory('AuthFactory', ['$http', '$cookies', '$location', '$rootScope', function ($http, $cookies, $location, $rootScope) {
			
			var baseUrl = 'http://localhost:3000';

			return {
				login: function (data, success, error) {
					$http.post(baseUrl + '/login', data).success(success).error(error);
				},
				signin: function (data, success, error) {
					$http.post(baseUrl + '/signin', data).success(success).error(error);
				},
				checkAuth: function (target) {
					if(!$cookies.getObject(target)) {
						$location.path('/auth');
						return false;
					}
					return true;
				},
				checkNotAuth: function (target) {
					if($cookies.getObject(target)) {
						$location.path('/circle');
					}
				},
				setAuth: function(target, data) {
					$cookies.putObject(target,data);
				},
				getAuth: function(target) {
					return $cookies.getObject(target)
				},
				removeAuth: function(target) {
					$cookies.remove(target);
				},
				checkJoinRoom: function (target) {
					if(!$cookies.getObject(target).currentRoom) {
						$location.path('/circle');
						return false;
					}
					return true;
				}


			}
		}])
		

})();