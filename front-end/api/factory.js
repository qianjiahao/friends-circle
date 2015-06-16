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
				logout: function (data, success, error) {
					$http.post(baseUrl + '/logout', data).success(success).error(error);
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
				}
			}
		}])
		.factory('SearchFactory', ['$http', function ($http){
			var baseUrl = 'http://localhost:3000';

			return {
				searchUser: function (data, success, error) {
					$http.post(baseUrl + '/search', data).success(success).error(error);
				}
			};
		}])
		.factory('HintFactory', ['$http', function ($http){
			var baseUrl = 'http://localhost:3000';

			return {
				getHintsCount: function (data, success, error) {
					$http.get(baseUrl + '/hints/count/' + data).success(success).error(error);
				},
				getAllHints: function (data, success, error) {
					$http.get(baseUrl + '/hints/all/' + data).success(success).error(error);
				},
				pullRequest: function (data, success, error) {
					$http.post(baseUrl + '/hint', data).success(success).error(error);
				},
				markHint: function (data, success, error) {
					$http.post(baseUrl + '/hint/mark', data).success(success).error(error);
				},
				acceptHint: function (data, success, error) {
					$http.post(baseUrl + '/hint/accept', data).success(success).error(error);
				}
			};
		}])
		.factory('FriendFactory', ['$http', function ($http){
			var baseUrl = 'http://localhost:3000';

			return {
				getAll: function (data, success, error) {
					$http.get(baseUrl + '/friends/all/' + data).success(success).error(error);
				},
				toBeFriends: function (data, success, error) {
					$http.post(baseUrl + '/friend/accept', data).success(success).error(error);
				},
				getOne: function (data, success, error) {
					$http.get(baseUrl + '/user/' + data).success(success).error(error);
				}
			};
		}])
		.factory('NewsFactory', ['$http', function ($http){
			var baseUrl = 'http://localhost:3000';

			return {
				getAll: function (data, success, error) {
					$http.get(baseUrl + '/news/all/' + data).success(success).error(error);
				},
				create: function (data, success, error) {
					$http.post(baseUrl + '/news/create', data).success(success).error(error);
				},
				save: function (data, success, error) {
					$http.post(baseUrl + '/news/save', data).success(success).error(error);
				},
				remove: function (data, success, error) {
					$http.post(baseUrl + '/news/remove', data).success(success).error(error);
				}
			};
		}])
		.factory('RoomFactory', ['$http','$location','AuthFactory', function ($http, $location, AuthFactory){
			var baseUrl = 'http://localhost:3000';

			return {
				checkAccess: function (target) {
					if(!AuthFactory.getAuth(target).currentRoom) {
						$location.path('/circle');
						return false;
					}
					return true;
				},
				getOne: function (data, success, error) {
					$http.get(baseUrl + '/room/' + data).success(success).error(error);
				},
				getRooms: function (data, success, error) {
					$http.get(baseUrl + '/rooms/' + data).success(success).error(error);
				},
				create: function (data, success, error) {
					$http.post(baseUrl + '/room/create', data).success(success).error(error);
				},
				join: function (data, success, error) {
					$http.post(baseUrl + '/room/join', data).success(success).error(error);
				},
				exit: function (data, success, error) {
					$http.post(baseUrl + '/room/exit', data).success(success).error(error);
				}
			};
		}])

})();