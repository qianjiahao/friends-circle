(function () {

	app
		.factory('AuthFactory', ['$http', function ($http) {
			
			var baseUrl = 'http://localhost:3000';

			return {
				login: function (data, success, error) {
					$http.post(baseUrl + '/login', data).success(success).error(error);
				},
				signin: function (data, success, error) {
					$http.post(baseUrl + '/signin', data).success(success).error(error);
				}
			}
		}])	

})();