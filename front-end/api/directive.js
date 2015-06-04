(function() {

	app
		.directive('headertemplate', ['$templateCache', function ($templateCache) {
			return {
				restrict: 'E',
				templateUrl: $templateCache.get('header.html')
			}
		}])
		.directive('footertemplate',['$templateCache', function ($templateCache) {
			return {
				restrict: 'E',
				templateUrl: $templateCache.get('footer.html')
			}
		}])
		.directive('index', function () {
			return {
				restrict: 'E',
				template: '<h1>Index Page</h1>',
				replace: true
			};
		})
		.directive('about', function () {
			return {
				restrict: 'E',
				template: '<h1>About Page</h1>',
				replace: true
			};
		})
		.directive('contact', function () {
			return {
				restrict: 'E',
				template: '<h1>Contact</h1>',
				replace: true
			}
		})
		
		
})();


