angular.module('App').controller('RecipeController', 
function($rootScope, $scope, $http, $mdToast, $cookies, $mdDialog, $route, services){

	var self             = $scope;
	var root             = $rootScope;
    root.pagetitle       = 'Recipe';
	self.loading         = true;
    self.cat_id          = -1;

    root.search_enable = true;
	root.toolbar_menu = { title: 'Add Recipe' };

    // receiver barAction from rootScope
	root.barAction =  function(ev) {
		self.addRecipe(ev);
	};

    // receiver submitSearch from rootScope
    self.$on('submitSearch', function (event, data) {
        self.q = data;
        loadPages();
    });

    $scope.$watch("max_item", function(val, old) { if(val != old){ loadPages(); } });
    $scope.$watch("cat_id", function(val, old) { if(val != old){ loadPages(); } });

    self.max_item = 20;
    self.max_item_array = [];
    for(var i = 1; i<5; i++){
        var _value = 20*i;
        var _text = _value+" items";
        self.max_item_array.push({value:_value, text:_text});
    }

    services.getCategoriesSimple().then(function(resp){
        var temp_category = {id:-1, name:'All Category'};
        self.categories_data = resp.data;
        self.categories_data.unshift(temp_category);
    });

    function loadPages() {
        $_q = self.q ? self.q : '';
        self.paging.limit = self.max_item;
        services.getRecipesCount($_q, self.cat_id).then(function (resp) {
            self.paging.total = Math.ceil(resp.data / self.paging.limit);
            self.paging.modulo_item = resp.data % self.paging.limit;
        });

        $limit = self.paging.limit;
        $current = (self.paging.current * self.paging.limit) - self.paging.limit + 1;
        if(self.paging.current == self.paging.total && self.paging.modulo_item > 0){
            self.limit = self.paging.modulo_item;
        }
        services.getRecipesByPage($current, $limit, $_q, self.cat_id).then(function(resp){
            self.recipes = resp.data;
            self.loading = false;
            //console.log(JSON.stringify(resp.data));
        });
    };

	self.deleteRecipe = function(ev, r) {
		var confirm = $mdDialog.confirm().title('Delete Confirmation')
		  .content('Are you sure want to delete Recipe : '+r.name+' ?')
		  .targetEvent(ev)
		  .ok('OK').cancel('CANCEL');

		$mdDialog.show(confirm).then(function() {
		  services.deleteRecipe(r.id).then(function(res){
			console.log(JSON.stringify(res));
			if(res.status == 'success'){
			  $mdToast.show($mdToast.simple().hideDelay(1000).content('Delete Recipe '+r.name+' Success!').position('bottom right'))
			  .then(function() {
				window.location.reload();
			  });
			}else{
			  $mdToast.show(
				$mdToast.simple().hideDelay(6000).action('CLOSE').content('Opps , Failed delete Recipe '+r.name).position('bottom right')
			  ).then(function(response){

			  });
			}        
		  });
		}, function() {

		});

	};  

	self.addRecipe = function(ev) {
    $mdDialog.show({
      controller          : RecipeControllerDialog,
      templateUrl         : 'templates/page/recipe/create.html',
      parent              : angular.element(document.body),
      targetEvent         : ev,
      clickOutsideToClose : false,
      recipe              : null
    })
  };

  self.editRecipe = function(ev, r) {
    $mdDialog.show({
      controller          : RecipeControllerDialog,
      templateUrl         : 'templates/page/recipe/create.html',
      parent              : angular.element(document.body),
      targetEvent         : ev,
      clickOutsideToClose : false,
      recipe              : r
    })
  };

  self.detailsRecipe = function(ev, r) {
    $mdDialog.show({
      controller          : DetailsRecipeControllerDialog,
      templateUrl         : 'templates/page/recipe/details.html',
      parent              : angular.element(document.body),
      targetEvent         : ev,
      clickOutsideToClose : true,
      recipe              : r
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

function DetailsRecipeControllerDialog($scope, $mdDialog, services, $mdToast, $route, recipe) {
  var self = $scope;
  self.recipe = recipe;
  console.log(self.recipe.category_name);
  self.hide = function() {
    $mdDialog.hide();
  };

  self.cancel = function() {
    $mdDialog.cancel();
  };
}

function RecipeControllerDialog($scope, $mdDialog, services, $mdToast, $route, $timeout, recipe) {
  var self = $scope;
  var isNew = (recipe == null) ? true : false;
  var original ;

  self.title      = (isNew) ? 'Add Recipe' : 'Edit Recipe';
  self.buttonText = (isNew) ? 'SAVE' : 'UPDATE';
  var now         = new Date().getTime();
  var ext         = null;
  self.submit_loading = false;
  self.send_gcm = false;
  
  services.getCategories().then(function(data){
    self.categories = data.data;
  });    
  
  if (isNew) {
    self.imageInvalid = true;
    original = { name : null, instruction : null, duration : null, image:null, category:null, date_create : now};
    self.recipe = angular.copy(original);
  } else {
    self.imageInvalid = false;
    original = recipe;
    self.recipe = angular.copy(original);
  }

  self.isClean = function() {
    return angular.equals(original, self.recipe);
  };

  self.onFileSelect = function(files) {
    self.file = null;
    self.imageInvalid = true;
    var f = files[0];
    if( (f.type =="image/jpeg" || f.type =="image/png" )&& f.size <= 500000){
      self.recipe.image = '-';
      self.file = f;
      self.imageInvalid = false;
      if(f.type =="image/jpeg"){
        ext = '.jpg';
      }else{
        ext = '.png';
      }
    }
    $mdToast.show($mdToast.simple().content("Selected file").position('bottom right'));
  };

  self.hide = function() {
    $mdDialog.hide();
  };

  self.cancel = function() {
    $mdDialog.cancel();
  };

  self.dir    = "/uploads/recipe/";
  self.submit = function(r) {
    self.submit_loading = true;
    $mdToast.show($mdToast.simple().content("Process...").position('bottom right'));
    var name  = "recipe_" + new Date().getTime() + ext;
    if(isNew){
      r.image = name;
      services.insertRecipe(r).then(function(resp){
        if(resp.status == 'success'){
          services.uploadFileToUrl(self.file, self.dir, name).then(function(res_upload){
            if(res_upload.status != 'success'){
              $mdToast.show($mdToast.simple().content("Failed uploading image").position('bottom right'));
            }
            self.afterSubmit(resp);
          });
        }else{
          self.afterSubmit(resp);  
        }
      });
    } else {
      if(self.file != null){
        var oldname = angular.copy(original.image);
        r.image = name;
        services.updateRecipe(r.id, r).then(function(resp){
          if(resp.status == 'success'){
            services.uploadFileToUrl(self.file, self.dir, name, oldname).then(function(res_upload){
              if(res_upload.status != 'success'){
                $mdToast.show($mdToast.simple().content("Failed uploading image").position('bottom right'));
              }
              self.afterSubmit(resp);
            });
          }else{
            self.afterSubmit(resp);  
          }
        }); 
      }else{
        services.updateRecipe(r.id, r).then(function(resp){
          self.afterSubmit(resp);
        });        
      }
    }

  };

  self.afterSubmit = function(resp) {
    $timeout(function(){ // give delay for good UI
      self.submit_loading = false;
      if(resp.status == 'success'){
        $mdToast.show($mdToast.simple().hideDelay(1000).content(resp.msg).position('bottom right'))
        .then(function() {
          if(self.send_gcm){
            self.sendGcmNotification();            
          }
          $mdDialog.hide();
          window.location.reload();    
        });  
      }else{
        $mdToast.show($mdToast.simple().hideDelay(3000).content(resp.msg).position('bottom right'))
      }    
    }, 1000); 
  };

  self.body = { data:null, registatoin_ids:null };
  self.data = { title:'', content:'' };
  self.sendGcmNotification = function(){
    self.data.title = 'Material Recipe';
    self.data.content = (isNew) ? 'New Recipe Added : '+self.recipe.name : 'New Update Recipe : '+self.recipe.name;
    self.body.data = self.data;
    services.sendNotifications(self.body).then(function(resp){
      console.log(JSON.stringify(resp.data));
    });
  }
  
}