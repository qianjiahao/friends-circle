(function () {

	app
		.config(function($stateProvider, $urlRouterProvider) {
			$stateProvider
				.state('index', {
					url: '/index',
					templateUrl: '../views/templates/index.html'
				})
				.state('about', {
					url: '/about',
					templateUrl: '../views/templates/about.html'
				})
				.state('contact', {
					url: '/contact',
					templateUrl: '../views/templates/contact.html'
				});

			$urlRouterProvider.otherwise('/index');

		})

})();