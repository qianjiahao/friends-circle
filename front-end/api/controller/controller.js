(function() {

	app
		.controller('IndexCtrl', ['$scope', function ($scope) {

			$scope.abc = 'Index';
			$scope.getName = function (name) {
				alert('name: ' + name);
			};
		}])

})();
