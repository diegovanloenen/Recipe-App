angular.module('App').controller('AboutController', 
function($rootScope, $scope){

	var self = $scope;
	var root = $rootScope;

    root.closeAndDisableSearch();
  	root.toolbar_menu = null;
	$rootScope.pagetitle = 'About';

});