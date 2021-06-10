angular.module('App').controller('SettingController', 
function($rootScope, $scope, $http, $mdToast, $cookies, $mdDialog, $route, $timeout, services){

	var cur_id = $cookies.session_uid;

	var self = $scope;
	var root = $rootScope;

    root.closeAndDisableSearch();
	self.submit_loading = false;

	root.toolbar_menu = null;
	var original;

	$rootScope.pagetitle = 'Setting';

	services.getUsers(cur_id).then(function(data){
		self.userdata = data.data;
		self.userdata.password = '*****';
		original = angular.copy(self.userdata);
		//console.log(JSON.stringify(self.userdata));
	}); 

	self.isClean = function() {
		return angular.equals(original, self.userdata);
	}
	
	self.isPasswordMatch = function() {
		if(self.re_password == null || self.re_password ==''){
			return true;
		}else{
			if(self.re_password == self.userdata.password ){
				return true;
			}else{
				return false;
			}
		}
	}

	self.submit = function(is_new) {
		self.submit_loading = true;
		if(!is_new){
		  console.log(JSON.stringify(self.userdata));
		  services.updateUsers(cur_id, self.userdata).then(function(resp){
			if(resp.status == 'success'){
				// saving session
				$cookies.session_uid = resp.data.users.id;
				$cookies.session_name = resp.data.users.name;
				$cookies.session_email = resp.data.users.email;
			}
			self.afterSubmit(resp);
		  });      
		}else{
		  if(self.userdata.password === '*****'){
			self.userdata.password = "";
			self.submit_loading = false;
			return;
		  }
		  self.userdata.id = null;
		  services.insertUser(self.userdata).then(function(resp){
			self.afterSubmit(resp);
		  });      
		}
	  
	}

	self.afterSubmit = function(resp) {
		console.log(JSON.stringify(resp));
		$timeout(function(){ // give delay for good UI
		  self.submit_loading = false;
		  if(resp.status == 'success'){
			$mdToast.show($mdToast.simple().hideDelay(1000).content(resp.msg).position('bottom right'))
			.then(function() {
			  window.location.reload();    
			});  
		  }else{
			$mdToast.show($mdToast.simple().hideDelay(3000).content(resp.msg).position('bottom right'))
		  }    
		}, 1000); 
	};

});