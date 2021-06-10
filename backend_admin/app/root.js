angular.module('App').controller('RootCtrl', 
function($rootScope, $scope, $mdSidenav, $mdToast, $mdDialog, $cookies, focus) {

  var self = $scope;
  var root = $rootScope;

  $scope.bgColor = '#d9d9d9';
  $scope.black = '#000000';

  // retrive session data
  self.data = {
    user: {
      name: $cookies.session_name,
      email: $cookies.session_email,
      icon: 'face'
    }
  };

  self.toggleSidenav = function() {
    $mdSidenav('left').toggle();
  };

  self.doLogout = function(ev){
    var confirm = $mdDialog.confirm().title('Logout Confirmation')
      .content('Are you sure want to logout from user : '+$cookies.session_name+' ?')
      .targetEvent(ev)
      .ok('OK').cancel('CANCEL');
    $mdDialog.show(confirm).then(function() {
      // clear session
      $cookies.session_uid 			= null;
      $cookies.session_name 		= null;
      $cookies.session_email 		= null;
	  $cookies.session_password 	= null; // as token
      window.location.href 			= '#login';
      $mdToast.show($mdToast.simple().content('Logout Success').position('bottom right'));
    });
  };

  self.toast_click = function(message) {
    var toast = $mdToast.simple().content('You clicked ' + message).position('bottom right');
    $mdToast.show(toast);
  };

  self.toast = function(message) {
    var toast = $mdToast.simple().content(message).position('bottom right');
    $mdToast.show(toast);
  };

  self.toastList = function(message) {
    var toast = $mdToast.simple().content('You clicked ' + message + ' having selected ' + $scope.selected.length + ' item(s)').position('bottom right');
    $mdToast.show(toast);
  };
  
  self.selected = [];
  self.toggle = function(item, list) {
    var idx = list.indexOf(item);
    if (idx > -1) list.splice(idx, 1);
    else list.push(item);
  };

  self.directHref= function(href){
    self.toggleSidenav();
    window.location.href = href;
  };

  self.sidenav = {
    actions: [{
        name: 'RECIPE',
        icon: 'restaurant_menu',
        link: '#recipe'
      }, {
        name: 'CATEGORY',
        icon: 'dns',
        link: '#category'
      }, {
        name: 'FCM',
        icon: 'notifications',
        link: '#fcm'
      }, {
        name: 'SETTING',
        icon: 'settings',
        link: '#setting'
      }, {
        name: 'ABOUT',
        icon: 'web_asset',
        link: '#about'
      }]
  };

  // flag toolbar action button
  root.search_enable = false;
  root.search_show = false;

  // when search icon click
  root.searchAction = function (ev) {
      focus('search_input');
      root.search_show = true;
      root.$broadcast('searchAction', null);
  };

  // when search close
  root.closeSearch = function (ev) {
      root.search_show = false;
      root.$broadcast('submitSearch', "");
  };

  // when search text submit
  root.submitSearch = function (ev, q) {
      root.$broadcast('submitSearch', q);
  };
  // when search text submit by press enter
  root.keypressAction = function (k_ev, q) {
      if (k_ev.which === 13) {
          root.$broadcast('submitSearch', q);
      }
  };

  root.closeAndDisableSearch = function () {
      root.search_enable = false;
      root.search_show = false;
  };

});