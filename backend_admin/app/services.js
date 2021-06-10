angular.module('App').factory("services", function($http, $cookies) {
  
	var serviceBase = 'app/services/';

	var obj = {};
	var token = $cookies.session_password;
	var config = { headers: { 'Token': token} };
  
	// user
	obj.doLogin = function (userdata) {
		return $http.post(serviceBase + 'login', userdata).then(function (results) {
		  return results;
		});
	};
	obj.getUsers = function(id){
		return $http.get(serviceBase + 'users?id=' + id);
	};
	obj.updateUsers = function (id, users) {
		var data = {id:id, users:users};
		return $http.post(serviceBase + 'updateUsers', data, config).then(function (status) {
			return status.data;
		});
	};
	obj.insertUser = function (user) {
		return $http.post(serviceBase + 'insertUser', user, config).then(function (results) {
			return results.data;
		});
	};

	// recipes
	obj.getRecipes = function(){
		return $http.get(serviceBase + 'recipes');
	};
	
	obj.getRecipesByPage = function (page, limit, q, cat_id) {
		return $http.get(serviceBase + 'recipesByPage?page=' +page+'&limit='+limit+'&q='+q+'&cat_id='+cat_id);
	};
	
	obj.getRecipesCount = function (q, cat_id) {
		return $http.get(serviceBase + 'recipesCount?q='+q+'&cat_id='+cat_id);
	};	

	obj.getRecipe = function(id){
		return $http.get(serviceBase + 'recipe?id=' + id);
	};

	obj.insertRecipe = function (recipe) {
		return $http.post(serviceBase + 'insertRecipe', recipe, config).then(function (results) {
			return results.data;
		});
	};

	obj.updateRecipe = function (id, recipe) {
		var data = {id:id, recipe:recipe};
		return $http.post(serviceBase + 'updateRecipe', data, config).then(function (status) {
			return status.data;
		});
	};

	obj.deleteRecipe = function (id) {
		return $http.delete(serviceBase + 'deleteRecipe?id=' + id, config).then(function (status) {
			return status.data;
		});
	};

	// category
	obj.getCategories = function(){
		return $http.get(serviceBase + 'categories');
	};
    obj.getCategoriesSimple = function(){
        return $http.get(serviceBase + 'categoriesSimple');
    };
	obj.getCategoriesByPage = function (page, limit, q) {
		return $http.get(serviceBase + 'categoriesByPage?page=' +page+'&limit='+limit+'&q='+q);
	};
	
	obj.getCategoriesCount = function (q) {
		return $http.get(serviceBase + 'categoriesCount?q='+q);
	};		

	obj.getCategory = function(id){
		return $http.get(serviceBase + 'category?id=' + id);
	};

	obj.insertCategory = function (category) {
		return $http.post(serviceBase + 'insertCategory', category, config).then(function (status) {
		  return status.data;
		});
	};

	obj.updateCategory = function (id, category) {
		var data = { id:id, category:category };
		return $http.post(serviceBase + 'updateCategory', data, config).then(function (status) {
			return status.data;
		});
	};

	obj.deleteCategory = function (id) {
		return $http.delete(serviceBase + 'deleteCategory?id=' + id, config).then(function (status) {
			return status.data;
		});
	};

	// gcm
	obj.getGcms = function(){
		return $http.get(serviceBase + 'gcms');
	};
	
	obj.getGcmsByPage = function (page, limit, q) {
		return $http.get(serviceBase + 'gcmsByPage?page=' +page+'&limit='+limit+'&q='+q);
	};	
	
	obj.getGcmsCount = function (q) {
		return $http.get(serviceBase + 'gcmsCount?q='+q);
	};		
	
	obj.getAllGcmId = function(){
		return $http.get(serviceBase + 'allGcmId');
	};

	obj.sendNotifications = function (body) {
		return $http.post(serviceBase + 'sendNotif', body).then(function (status) {
		  return status.data;
		});
	};


  // obj.uploadFileToUrl = function(f){
  //   console.log('in services');
  //   var fd = new FormData();
  //   fd.append("file", f);
  //   fd.append("file_name", f.name);
  //   console.log(fd);
  //   return $http.post(serviceBase + 'uploadFileToUrl', fd).then(function (status) {
  //       return status.data;
  //   });
  // };  

	obj.uploadFileToUrl = function(f, dir, name, oldname){
		var fd = new FormData();
		fd.append("file", f);
		fd.append("target_dir", dir);
		fd.append("file_name", name);
        fd.append("old_name", oldname);
		var request = {
			method  : 'POST',
			url     : 'app/uploader/uploader.php',
			data    : fd,
			headers : { 'Content-Type': undefined }
		};

		// SEND THE FILES.
		return $http(request).then(function (resp) {
		  //console.log(JSON.stringify(resp.data));
		  return resp.data;
		});
	};  

	obj.getBase64 = function(f){
		return $http.post(serviceBase + 'getBase64', f).then(function (status) {
			//console.log(JSON.stringify(status.data));
			return status.data;
		});
	};  

  return obj;   
});