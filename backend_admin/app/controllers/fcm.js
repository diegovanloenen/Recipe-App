angular.module('App').controller('FcmController',
  function($rootScope, $scope, $http, $mdToast, $cookies, $mdDialog, $route, services){

    $rootScope.pagetitle = 'FCM';
    var self             = $scope;
    var root             = $rootScope;	
    self.loading         = true;
    root.search_enable   = true;

    root.toolbar_menu = { title : 'Send FCM' };
    root.barAction =  function(ev) {
      self.sendGcm(ev);
    };

    // receiver submitSearch from rootScope
    self.$on('submitSearch', function (event, data) {
      self.q = data;
      loadPages();
    });
	
	function loadPages() {
        $_q = self.q ? self.q : '';
        services.getGcmsCount($_q).then(function(resp){
            self.paging.total = Math.ceil(resp.data / self.paging.limit);
            self.paging.modulo_item = resp.data % self.paging.limit;
        });

		$limit = self.paging.limit;
		$current = (self.paging.current * self.paging.limit) - self.paging.limit + 1;
		if(self.paging.current == self.paging.total && self.paging.modulo_item > 0){
		   self.limit = self.paging.modulo_item;
		}
		services.getGcmsByPage($current, $limit, $_q).then(function(resp){
			self.gcm = resp.data;
			self.loading = false;
			//console.log(JSON.stringify(resp.data));
		});
	}

    self.sendGcm = function(ev) {
      $mdDialog.show({
        controller          : FcmControllerDialog,
        templateUrl         : 'templates/page/fcm/send.html',
        parent              : angular.element(document.body),
        targetEvent         : ev,
        clickOutsideToClose : false,
        recipe              : null
      })
    };
	
	//pagination property
	self.paging = {
		total : 0,    // total whole item
		current : 1,  // start page
		step : 3,     // count number display
		limit : 20,   // max item per page
		modulo_item : 0, 
		onPageChanged: loadPages
	};
	
  });


function FcmControllerDialog($scope, $mdDialog, services, $mdToast, $route, $timeout, recipe) {
  var self = $scope;

  self.title      = 'Send FCM';
  self.submit_loading = false;
  self.hide = function() { $mdDialog.hide(); };
  self.cancel = function() { $mdDialog.cancel(); };
  self.showResult = false;
  self.body={
    data:null,
    registatoin_ids:null
  };

  self.submit = function() {
    self.body.data = self.data;
    self.submit_loading = true;
    self.showResult = false;

    services.sendNotifications(self.body).then(function(resp){
      console.log(JSON.stringify(resp.data));
      if( resp.data!= null && resp.data!= '' ){
        self.showResult = true;
        self.result = resp.data;
      }else{
        $mdToast.show($mdToast.simple().content("Failed send GCM").position('bottom right'));
      }
      self.submit_loading = false;
    });
  }

}