angular.module('App').controller('LoginController',
function($rootScope, $scope, $http, $mdToast, $cookies, $route, $location, $timeout, services){

	if(!$rootScope.isLogin){ window.location.href = '#recipe'; }

	var self 						= $scope;
	var root 						= $rootScope;
	$rootScope.isLogin	= true;
	root.toolbar_menu 	= null;

	$rootScope.pagetitle = 'Login';
	self.submit_loading = false;

	self.doLogin = function(){
		self.submit_loading = true;
		services.doLogin(self.userdata).then(function(result){
    	$timeout(function(){ // give delay for good UI
			if(result.data != ""){

				// saving session
				$cookies.session_uid 		= result.data.id;
				$cookies.session_name 		= result.data.name;
				$cookies.session_email 		= result.data.email;
				$cookies.session_password 	= result.data.password; // as token

				$mdToast.show($mdToast.simple().content('Login Success').position('bottom right'));
                window.location.href = '#recipe';
                $route.reload();
			}else{
				$mdToast.show($mdToast.simple().content('Login Failed').position('bottom right'));
			}
			self.submit_loading = false;
		}, 1000);
    	console.log(JSON.stringify(result.data));
		});

	};

});