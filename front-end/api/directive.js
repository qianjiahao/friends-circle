(function() {

	app
		.directive('headertemplate', ['$templateCache', function ($templateCache) {
			return {
				restrict: 'E',
				// templateUrl: '../views/templates/header.html'    
				templateUrl: $templateCache.get('header.html')
			}
		}])
		.directive('footertemplate',['$templateCache', function ($templateCache) {
			return {
				restrict: 'E',
				templateUrl: $templateCache.get('footer.html')
			}
		}])
		.directive('fold', ['$location','$rootScope',function ($location, $rootScope) {
			return {
				restrict: 'A',
				link: function (scope, element, attrs) {
					element.find('li').on('click', function() {

						if(!scope.isFolded) {
							scope.isFolded = true;
							element.slideUp();
							scope.$apply();                      // refresh the view [Important]
						// $rootScope.currentPath = $location.path();
						}
						element.find('li').removeClass('active');
						angular.element(this).addClass('active');
					});
					function toggleFold(isFold) {
					
						isFold ? element.slideUp() : element.slideDown();
					}
					scope.$watch(attrs.fold, function (isFold) {
						
						toggleFold(isFold);

					});
				}
			}
		}])



})();


