(function() {

	app
		.directive('index', function () {
			return {
				restrict: 'E',
				template: '<h1>Index Page</h1>',
				replace: true,
				link: function (scope, element, attrs) {
					element.on('click', function () {
						console.log('click');
					}).on('mouseenter', function () {
						console.log('mouseenter');
					}).on('mouseout', function () {
						console.log('mouseout');
					});
					console.log(angular.element(this));
				}	
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
		.directive('test', function () {
			return {
				restrict: 'AE',
				template: '<input type="text" ng-focus="isFocus">',
				replace: true,
				link: function (scope, element, attrs) {
					console.log(element);;
				}
			}
		})
		
		
})();


