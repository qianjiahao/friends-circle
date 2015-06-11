(function() {

	app
		.controller('NavbarController', ['$scope','$rootScope', '$location','$window','AuthFactory', function ($scope, $rootScope, $location, $window, AuthFactory){

			/*
				policy control .
			 */
			$rootScope.isAuth = AuthFactory.checkAuth('User');

			$rootScope.totalHints = 0;


			/*
				[isNeedFoldCurrent] : save the current the boolean if window need fold or not , 
				[isNeedFoldCache] : save the last value of boolean , if value change and then apply the viewmodel ,
				[minWindowSize] : the boundary value of the navbar hide or show .
			 */
			var isNeedFoldCurrent, isNeedFoldCache, minWindowSize = 768;


			$scope.isFolded = isNeedFoldCache = isNeedFoldCurrent =  $window.document.documentElement.offsetWidth <= minWindowSize ? true : false;

			/*
				{toggleNavbar} toggle the navbar if the [windowSizeCurrent] less than 768 .
			 */
			$scope.toggleNavbar = function () {
				if(isNeedFoldCurrent) {
					$scope.isFolded = !$scope.isFolded;
				}else{
					$scope.isFolded = false;
				}
			}

			/*
				{onresize} when window was resized , check the cache and choose apply or not .
			 */
			$window.onresize = function() {
				isNeedFoldCurrent = $window.document.documentElement.offsetWidth <= 768 ? true : false
				if(isNeedFoldCache !== isNeedFoldCurrent) {
					$scope.isFolded = isNeedFoldCache = isNeedFoldCurrent;
					$scope.$apply();
				}

			}

			/*
				[isActive] check the item which is active , add the active class .
			 */
			$scope.isActive = function (viewLocation) {
			     var active = (viewLocation === $location.path());
			     return active;
			};


		}])
		.controller('LoginController', ['$scope','$rootScope', '$location', '$http', 'AuthFactory', function ($scope, $rootScope, $location, $http, AuthFactory){
			/*
				check not authentication .
			 */
			AuthFactory.checkNotAuth('User');

			/*
				{toggleSignin} toggle signin button .
			 */
			$scope.toggleSignin = function () {
				$rootScope.isSignin = !$rootScope.isSignin;
			}

			/*
				{login} login the system .
			 */
			$scope.login = function () {

				AuthFactory.login({
					email: $scope.loginEmail, password: $scope.loginPassword
				},function(data,status) {
					if(data.status === 'error') {
						$location.path('/auth');
						$scope.loginEmail = data.data.email;
						$scope.loginPassword = data.data.password;
						console.log(data.message);
					}else{
						AuthFactory.setAuth('User',data.data);
	 					$rootScope.isAuth = AuthFactory.checkAuth('User');
	 					$rootScope.username = AuthFactory.getAuth('User').username;
						$rootScope.hintChanged = !$rootScope.hintChanged;
	 					$location.path('/chatroom');
	 					console.log(data)
					}
				},function(error,status) {
					console.log(error,status);
				});
			}

		}])
		.controller('SigninController', ['$scope', '$rootScope', '$location', 'AuthFactory', function ($scope, $rootScope, $location, AuthFactory){
			
			/*
				check authentication .
			 */
			AuthFactory.checkAuth('User');

			/*
				[isSignin] show or hide sign in content .
			 */
			$rootScope.isSignin = true;

			/*
				[isMatch] flag password and confiration match or not .
			 */
			$scope.$watchGroup(['signinPassword','signinConfiration'], function (newVal) {
				$scope.isMatch = newVal[0] === newVal[1];
			});

			/*
				{signin} sign in the system .
			 */
			$scope.signin = function () {

				AuthFactory.signin({
					username: $scope.signinUsername,
					password: $scope.signinPassword,
					email: $scope.signinEmail,
					signature: $scope.signinSignature
				},function (data, status) {
					if(data.status === 'error') {
						$location.path('/auth');
						$scope.signinUsername = data.data.username;
						$scope.signinPassword = data.data.password;
						$scope.signinEmail = data.data.email;
						$scope.signinSignature = data.data.signature;
						console.log(data.message);
					}else{
						AuthFactory.setAuth('User',data.data);
						$rootScope.isAuth = AuthFactory.checkAuth('User');
						$rootScope.username = AuthFactory.getAuth('User').username;
						$rootScope.totalHints = 0;
						$location.path('/chatroom');
						console.log(data);
					}
				},function (error, status) {
					console.log(data,status);
				});
			}

		}])
		.controller('LogoutController', ['$scope','$rootScope','AuthFactory','socket', function ($scope, $rootScope, AuthFactory, socket){
			
			/*
				{logout} logout the system .
			 */
			$scope.logout = function () {
				AuthFactory.removeAuth('User');
				$rootScope.isAuth = AuthFactory.checkAuth('User');
				$rootScope.username = null;
				$rootScope.totalHints = 0;
			}
		}])
		.controller('UserInfoController',['$scope', '$rootScope', '$http', 'AuthFactory', 'socket' ,function ($scope, $rootScope, $http, AuthFactory, socket) {
			
			/*
				[username] , [signature] show username and user signature .
			 */
			var user = AuthFactory.getAuth('User');
			if(user) {
				$rootScope.username = user.username;
				$scope.signature = user.signature;
				$rootScope.hintChanged = !$rootScope.hintChanged;

			}
			/*
				[isHint] flag there is hint or not .	
			 */

			 $rootScope.hintChanged = false;

			/*
				subscribe the hint by socket.io .
			 */
			socket.on('receive hint',function (data) {
				if(AuthFactory.getAuth('User').id === data.targetId) {
					$rootScope.hintChanged = !$rootScope.hintChanged;
				}
			});

				
			$scope.$watch('hintChanged', function(newValue) {
				if(AuthFactory.checkAuth('User')) {

					$http.get('http://localhost:3000/hints/unmarked?id=' + AuthFactory.getAuth('User').id).success(function (data) {
							$rootScope.totalHints = data.total;
							console.log('total hints :' + data.total);
						}).error(function (error) {
							console.log(error);
						});
				}
			});
		}])
		.controller('ChatController', ['$scope', '$http', 'socket', 'AuthFactory', function ($scope, $http, socket, AuthFactory) {
			if(AuthFactory.checkAuth('User')) {

				/*
					[message] contain chatroom message .	
				 */
				$scope.message = [];

				/*
					[room] type of chatroom .
				 */
				$scope.room = '公共频道';

				/*
					{sendMessage} send message to server by socket.io .
				 */
				$scope.sendMessage = function(data) {
					socket.emit('send message',{
						username: AuthFactory.getAuth('User').username,
						message: $scope.content,
						date: moment().format('HH:mm:ss')
					});
					$scope.content = '';
				}

				/*
					{receive message} receive message from server .
				 */
				socket.on('receive message', function (data) {
					data.isSelf = data.username === AuthFactory.getAuth('User').username ? true : false ;
					$scope.message.push(data);
					var len = $scope.message.length;
					if(len >= 100) {
						$scope.message = $scope.message.slice(len/4);
					}
				});

				$scope.isCreate = false;

				$scope.createRoom = function(){

				}
			}

		}])
		.controller('SearchFriendController', ['$scope', '$http', 'AuthFactory', 'socket', function ($scope, $http, AuthFactory, socket) {
			
			/*
				[searchFriendContent] search bar content .
			 */
			$scope.searchFriendContent = '';

			/*
				[noSearchResult] flag no search result .
			 */
			$scope.noSearchResult = false;

			/*
				{search} search friends by email or nickname .
			 */
			$scope.search = function() {
				$scope.searchResult = null;
				$http.post('http://localhost:3000/search',{
					content:$scope.searchFriendContent
				}).success(function(data) {
					if(data.data && data.data.length) {
						$scope.searchResult = data.data;
						$scope.noSearchResult = false;
					}else{
						$scope.searchResult = null;
						$scope.noSearchResult = true;
					}
				}).error(function(error) {
					console.log(error);
				})
				$scope.searchFriendContent = '';
			}

			/*
				{applyFor} apply for other people to be friend .
			 */
			
			$scope.isApply = false;
			$scope.applyFor = function(id,hintContent){
				 $http.post('http://localhost:3000/hints', {
				 	targetId: id,
				 	hintType: 'apply for',
				 	hintContent: hintContent,
				 	senderId: AuthFactory.getAuth('User').id,
				 	senderEmail: AuthFactory.getAuth('User').email,
				 }).success(function (data) {
				 	socket.emit('send hint',data);
				 }).error(function (error) {
				 	console.log(error);
				 });

				 this.isApply = true;
				 this.applyContent = '';
			}
		}])
		.controller('HintController', ['$scope', '$http', '$location', '$rootScope', 'AuthFactory', function ($scope, $http, $location, $rootScope, AuthFactory){
			
			$http.get('http://localhost:3000/hints/all?targetId=' + AuthFactory.getAuth('User').id)
				.success(function (data) {
					$scope.hintsList = data.hints;
					console.log(data)
				}).error(function (error) {
					console.log(error)
				});


			$scope.isMarked = false;
			$scope.mark = function(id) {
				$http.post('http://localhost:3000/hint/unmarked',{
					_id: id 
				}).success(function (data) {
					
				}).error(function (error) {
					console.log(error);
				})

				this.isMarked = true;
				modifyHintIntoDB(id);
				modifyHintInfoPage();

			}

			function modifyHintIntoDB(id){

				$http.post('http://localhost:3000/hint',{
					targetId: AuthFactory.getAuth('User').id,
					_id: id 
				}).success(function (data) {

				}).error(function (error) {
					console.log(error);
				})
			}
			function modifyHintInfoPage(){
				if($rootScope.totalHints) {
					$rootScope.totalHints -= 1;
				}
				console.log('result :' + $rootScope.totalHints);
			}


			$scope.isAccepted = false;
			$scope.accept = function(id) {

				var self = this;
				$http.post('http://localhost:3000/hint/unaccepted',{
					_id: id
				}).success(function (data) {
					if(!data.hint.mark) {
						console.log('mark : ',data.hint.mark);
						self.isMarked = true;
						modifyHintInfoPage();
					}
					self.isAccepted = true;

					modifyHintIntoDB(id);
				}).error(function (error) {
					console.log(error);
				});
				
			}
		}])
})();

