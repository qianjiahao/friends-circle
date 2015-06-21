/**
 * Main Angular Module
 */
var app = angular.module("app", ['ui.router','ngCookies','btford.socket-io','ngSanitize']);


	/*
		Cache the templete before load it .
	 */
	app.run(['$templateCache', function ($templateCache) {
		$templateCache.put('header.html','../views/templates/header.html');
		$templateCache.put('footer.html','../views/templates/footer.html');
	}]);


