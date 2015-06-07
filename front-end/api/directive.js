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
})();


