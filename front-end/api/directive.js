(function() {

	app
		.directive('headertemplate', ['$templateCache', function ($templateCache) {
			return {
				restrict: 'E',
				templateUrl: '../views/templates/header.html'   // $templateCache.get('header.html')
			}
		}])
		.directive('footertemplate',['$templateCache', function ($templateCache) {
			return {
				restrict: 'E',
				templateUrl: $templateCache.get('footer.html')
			}
		}])
		.directive('fold', function () {
			return {
				restrict: 'A',
				link: function (scope, element, attrs) {
					element.on('click', function() {
						scope.isFolded = !scope.isFolded;			
						element.slideUp();
						scope.$apply();                      // refresh the view [Important]
					})
					function toggleFold(isFold) {
					
						isFold ? element.slideUp() : element.slideDown();
					}
					scope.$watch(attrs.fold, function (isFold) {
						toggleFold(isFold);
					});
				}
			}
		})

})();


