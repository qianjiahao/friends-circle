(function () {

	app
		.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
			$stateProvider
				.state('auth', {
					url: '/auth',
					templateUrl: '../views/templates/auth.html'
				})
				.state('search', {
					url: '/search',
					templateUrl: '../views/templates/search.html'
				})
				.state('circle', {
					url: '/circle',
					templateUrl: '../views/templates/circle.html'
				})
				.state('chatroom', {
					url: '/chatroom',
					templateUrl: '../views/templates/chatroom.html'
				})
				.state('hint', {
					url: '/hint',
					templateUrl: '../views/templates/hint.html'
				})

			$urlRouterProvider.otherwise('/auth');

		}])

})();