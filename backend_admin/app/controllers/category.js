angular.module('App').controller('CategoryController', 
function($rootScope, $scope, $http, $mdToast, $cookies, $mdDialog, $route, services){

	$rootScope.pagetitle = 'Category';
	var self             = $scope;
	var root             = $rootScope;
	self.loading         = true;
    root.search_enable   = true;

	root.toolbar_menu    = { title: 'Add Category' };

    // receiver barAction from rootScope
	root.barAction =  function(ev) {
		self.addCategory(ev);
	};

    // receiver submitSearch from rootScope
    self.$on('submitSearch', function (event, data) {
        self.q = data;
        loadPages();
    });

	function loadPages() {
        $_q = self.q ? self.q : '';
        services.getCategoriesCount($_q).then(function (resp) {
            self.paging.total = Math.ceil(resp.data / self.paging.limit);
            self.paging.modulo_item = resp.data % self.paging.limit;
        });

		$limit = self.paging.limit;
		$current = (self.paging.current * self.paging.limit) - self.paging.limit + 1;
		if(self.paging.current == self.paging.total && self.paging.modulo_item > 0){
		   self.limit = self.paging.modulo_item;
		}
		services.getCategoriesByPage($current, $limit, $_q).then(function(resp){
			self.categories = resp.data;
			self.loading = false;
			//console.log(JSON.stringify(resp.data));
		});
	}
	
	self.deleteCategory = function(ev, c) {
		var confirm = $mdDialog.confirm().title('Delete Confirmation')
		.content('Are you sure want to delete Category : '+c.name+' ?')
		.targetEvent(ev)
		.ok('OK').cancel('CANCEL');

		$mdDialog.show(confirm).then(function() {
			services.deleteCategory(c.id).then(function(res){
			console.log(JSON.stringify(res));
			if(res.status == 'success'){
			  $mdToast.show($mdToast.simple().hideDelay(1000).content('Delete Category '+c.name+' Success!').position('bottom right'))
			  .then(function() {
				window.location.reload();
			  });
			}else{
			  $mdToast.show(
				$mdToast.simple().hideDelay(6000).action('CLOSE').content('Opps , Failed delete category '+c.name).position('bottom right')
			  ).then(function(response){

			  });
			}
			});
		}, function() {

		});

	};  

	self.addCategory = function(ev) {
		$mdDialog.show({
			controller          : CategoryControllerDialog,
			templateUrl         : 'templates/page/category/create.html',
			parent              : angular.element(document.body),
			targetEvent         : ev,
			clickOutsideToClose : false,
			category            : null
		})
	};

	self.editCategory = function(ev, c) {
		$mdDialog.show({
			controller          : CategoryControllerDialog,
			templateUrl         : 'templates/page/category/create.html',
			parent              : angular.element(document.body),
			targetEvent         : ev,
			clickOutsideToClose : false,
			category            : c
		})
	};   

  self.viewBanner = function(ev, c){
    $mdDialog.show({
      controller          : CategoryViewBannerControllerDialog,
      template            : '<md-dialog ng-cloak >' +
                            '  <md-dialog-content style="max-width:800px;max-height:810px;" >' +
                            '   <img style="margin: auto; max-width: 100%; max-height= 100%;" ng-src="uploads/category/{{category.banner}}">' +
                            '  </md-dialog-content>' +
                            '</md-dialog>',
      parent              : angular.element(document.body),
      targetEvent         : ev,
      clickOutsideToClose : true,
      category            : c
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

function CategoryViewBannerControllerDialog($scope, $mdDialog, $mdToast, category) {
  var self = $scope;
  self.category = category;
}

function CategoryControllerDialog($scope, $mdDialog, services, $mdToast, $route, $timeout, category) {
  var self = $scope;
  var isNew = (category == null) ? true : false;
  var original ;

  self.title      = (isNew) ? 'Add Category' : 'Edit Category';
  self.buttonText = (isNew) ? 'SAVE' : 'UPDATE';
  var d           = new Date();
  var now         = d.getTime();
  var ext         = null;
  self.submit_loading = false;
  self.send_gcm = false;

  if (isNew) {
    self.bannerInvalid = true;
    original = { name : null, banner : null, description:null};
    self.category = angular.copy(original);
  } else {
    self.bannerInvalid = false;
    original = category;
    self.category = angular.copy(original);
  }

  self.onFileSelect = function(files) {
    self.file = null;
    self.bannerInvalid = true;
    var f = files[0];
    if( (f.type =="image/jpeg" || f.type =="image/png" )&& f.size <= 500000){
      self.category.banner = '-';
      self.file = f;
      self.bannerInvalid = false;
      if(f.type =="image/jpeg"){
        ext = '.jpg';
      }else{
        ext = '.png';
      }
    }
    $mdToast.show($mdToast.simple().content("Selected file").position('bottom right'));
  };

  self.isClean = function() {
    return angular.equals(original, self.category);
  }

  self.hide = function() {
    $mdDialog.hide();
  };

  self.cancel = function() {
    $mdDialog.cancel();
  };

  self.dir    = "/uploads/category/";
  self.submit = function(c) {
    self.submit_loading = true;
    var name  = "category_" + new Date().getTime() + ext;
    if(isNew){
      c.banner = name;
      services.insertCategory(c).then(function(resp){
        if(resp.status == 'success'){
          services.uploadFileToUrl(self.file, self.dir, name, "").then(function(res_upload){
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
        var oldname = angular.copy(original.banner);
        c.banner = name;
        services.updateCategory(c.id, c).then(function(resp){
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
        services.updateCategory(c.id, c).then(function(resp){
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
    self.data.content = (isNew) ? 'New Category Added : '+self.category.name : 'New Update Category : '+self.category.name;
    self.body.data = self.data;
    services.sendNotifications(self.body).then(function(resp){
      console.log(JSON.stringify(resp.data));
    });
  }

}