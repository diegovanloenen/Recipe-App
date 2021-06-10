
angular.module('App', [ 'ngMaterial', 'ngRoute', 'ngMessages', 'ngCookies', 'ngSanitize', 'cl.paging', 'textAngular']);

angular.module('App').config( 
  function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
    .primaryPalette('deep-purple')
    .accentPalette('purple');
  }
);

angular.module('App').config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/recipe', {
        templateUrl : 'templates/page/recipe/recipe.html',
        controller  : 'RecipeController'
      }).
      when('/category', {
        templateUrl : 'templates/page/category/category.html',
        controller  : 'CategoryController'
      }).
      when('/fcm', {
        templateUrl : 'templates/page/fcm/fcm.html',
        controller  : 'FcmController'
      }). 
      when('/setting', {
        templateUrl : 'templates/page/setting/setting.html',
        controller  : 'SettingController'
      }).  
      when('/about', {
        templateUrl : 'templates/page/about/about.html',
        controller  : 'AboutController'
      }).     
      when('/login', {
        templateUrl : 'templates/page/login/login.html',
        controller  : 'LoginController'
      }).
      otherwise({
        redirectTo  : '/login'
      });
}]);

angular.module('App').run(function($location, $rootScope, $cookies) {
  $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
    // $rootScope.title = current.$$route.title;
  });

  $rootScope.$on('$locationChangeStart', function (event, next, current) {
    $rootScope.isLogin	= true;
    if($cookies.session_uid == 'null' || $cookies.session_uid == null){
        $location.path('/login');
    } else {
        $rootScope.isLogin	= false;
    }
  });
});

angular.module('App').factory('focus', function($timeout, $window) {
    return function(id) {
        // timeout makes sure that is invoked after any other event has been triggered.
        // e.g. click events that need to run before the focus or inputs elements that are in a disabled state but are enabled when those events are triggered.
        $timeout(function() {
            var element = $window.document.getElementById(id);
            if(element)element.focus();
        });
    };
});
