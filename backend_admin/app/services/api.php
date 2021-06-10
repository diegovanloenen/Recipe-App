<?php
 	require_once("Rest.inc.php");

	class API extends REST {

		public $data = "";
		const demo_version = false;

		const DB_SERVER = "localhost";
		const DB_USER = "your_database_user";
		const DB_PASSWORD = "your_database_user_password";
		const DB = "your_database_name";
		const GOOGLE_API_KEY = "AIzaSyBeZBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

		private $db = NULL;
		private $mysqli = NULL;
		public function __construct(){
			parent::__construct();				// Init parent contructor
			$this->dbConnect();					// Initiate Database connection
		}

		/*
		 *  Connect to Database
		*/
		private function dbConnect(){
			$this->mysqli = new mysqli(self::DB_SERVER, self::DB_USER, self::DB_PASSWORD, self::DB);
			$this->mysqli->query('SET CHARACTER SET utf8');
		}

		/*
		 * Dynmically call the method based on the query string
		 */
		public function processApi(){
			$func = strtolower(trim(str_replace("/","",$_REQUEST['x'])));
			if((int)method_exists($this,$func) > 0)
				$this->$func();
			else
				$this->response('processApi - method not exist',404); // If the method not exist with in this class "Page not found".
		}

		/* Api Checker */
		private function checkResponse(){
			if (mysqli_ping($this->mysqli)){
				echo "Database Connection : Success";
			}else {
				echo "Database Connection : Error";
			}
		}
		
		// security for filter manipulate data		
		private function checkAuthorization(){
			$resp = array("status" => 'Failed', "msg" => 'Unauthorized' );
			if(isset($this->_header['Token']) && !empty($this->_header['Token'])){
				$token = $this->_header['Token'];
				$query = "SELECT id FROM users WHERE password='$token' ";
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				if($r->num_rows < 1) {
					$this->response($this->json($resp), 200);
				}
			} else {
				$this->response($this->json($resp), 200);
			}
		}		

		/*
		 * USERS TRANSACTION ------------------------------------------------------------------------------------------------------------------
		 */
		private function login(){
			if($this->get_request_method() != "POST") $this->response('',406);
			$data = json_decode(file_get_contents("php://input"),true);
			$username = $data["username"];
			$password = $data["password"];
			if(!empty($username) and !empty($password)){ // empty checker
				$query="SELECT id, name, username, email, password FROM users WHERE username = '$username' AND password = '".md5($password)."' LIMIT 1";
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				if($r->num_rows > 0) {
					$result = $r->fetch_assoc();
					$this->response($this->json($result), 200);
				}
				$this->response('', 204);	// If no records "No Content" status
			}
			$error = array('status' => "Failed", "msg" => "Invalid Email address or Password");
			$this->response($this->json($error), 400);
		}

		private function users(){
			if($this->get_request_method() != "GET") $this->response('',406);
			$id = (int)$this->_request['id'];
			$query = "SELECT id, name, username, email FROM users WHERE id=$id";
			$this->get_one($query);
		}

		private function updateUsers(){
			if($this->get_request_method() != "POST")$this->response('',406);
			if(self::demo_version){
				$m = array('status' => "failed", "msg" => "Ops, this is demo version", "data" => null);
				$this->response($this->json($m),200);
			}
			
			$this->checkAuthorization();
			$data = json_decode(file_get_contents("php://input"),true);
			if(!isset($data['id'])) $this->responseInvalidParam();
			
			$id = (int)$data['id'];
			$password = $data['users']['password'];
			if($password == '*****'){
				$column_names = array('id', 'name', 'username', 'email');
			}else{
				$data['users']['password'] = md5($password);
				$column_names = array('id', 'name', 'username', 'email', 'password');
			}
			$table_name = 'users';
			$this->post_update($id, $data, $column_names, $table_name);
		}

		private function insertUser(){
			if($this->get_request_method() != "POST") $this->response('',406);
			if(self::demo_version){
				$m = array('status' => "failed", "msg" => "Ops, this is demo version", "data" => null);
				$this->response($this->json($m),200);
			}
			$this->checkAuthorization();
			$users = json_decode(file_get_contents("php://input"),true);
			
			$users['password'] = md5($users['password']);
			$column_names = array('name', 'username', 'email', 'password');
			$table_name = 'users';
			$this->post_one($users, $column_names, $table_name);
		}

		/*
		 * RECIPES TRANSACTION --------------------------------------------------------------------------------------------------------------
		 */
		 
		private function listRecipes(){
			if($this->get_request_method() != "GET") $this->response('',406);
			$limit = isset($this->_request['count']) ? ((int)$this->_request['count']) : 10;
			$page = isset($this->_request['page']) ? ((int)$this->_request['page']) : 1;
			
			$offset = ($page * $limit) - $limit;
			$count_total = $this->get_count_result("SELECT COUNT(DISTINCT r.id) FROM recipe r");
			$query = "SELECT distinct r.id, r.name, r.instruction, r.duration, r.image, r.category, c.name as category_name, r.date_create 
					  FROM recipe r, category c WHERE r.category=c.id ORDER BY r.date_create DESC LIMIT $limit OFFSET $offset";
			$recipes = $this->get_list_result($query);
			$count = count($recipes);
			$respon = array(
				'status' => 'success', 'count' => $count, 'count_total' => $count_total, 'pages' => $page, 'recipes' => $recipes
			);
			$this->response($this->json($respon), 200);
		}
		
		private function recipes(){
			if($this->get_request_method() != "GET") $this->response('',406);
			$query="SELECT distinct r.id, r.name, r.instruction, r.duration, r.image, r.category, c.name as category_name, r.date_create 
					FROM recipe r, category c WHERE r.category=c.id ORDER BY r.date_create DESC";
			$this->get_list($query);
		}
		
		private function recipesCount(){
			if($this->get_request_method() != "GET") $this->response('',406);

            $cat_id = (isset($this->_request['cat_id'])) ? (int)$this->_request['cat_id'] : -1 ;
            $q = (isset($this->_request['q'])) ? ($this->_request['q']) : "";

            $query = "SELECT COUNT(DISTINCT r.id) FROM recipe r ";
            $keywordQuery = "(r.name REGEXP '$q' OR r.instruction REGEXP '$q' OR r.name REGEXP '$q') ";
            if($cat_id != -1){
                $cat_id = (int)$cat_id;
                $query = $query . ", category c WHERE r.category=c.id AND r.category=$cat_id ";
                if($q != "") $query = $query . "AND " . $keywordQuery ;
            }else{
                if($q != "") $query = $query . "WHERE " . $keywordQuery ;
            }
			$this->get_count($query);
		}		
		
		private function recipesByPage(){
			if($this->get_request_method() != "GET") $this->response('',406);

            $limit = (int)$this->_request['limit'];
            $offset = ((int)$this->_request['page']) - 1;
            $cat_id = (isset($this->_request['cat_id'])) ? (int)$this->_request['cat_id'] : -1 ;
            $q = (isset($this->_request['q'])) ? ($this->_request['q']) : "";
			
			$query = "SELECT r.*, c.name as category_name FROM recipe r, category c WHERE r.category=c.id ";
            if($cat_id != -1){
                $cat_id = (int)$cat_id;
                $query = $query . " AND r.category=$cat_id ";
            }
            if($q != "") $query = $query . "AND (r.name REGEXP '$q' OR r.instruction REGEXP '$q' OR c.name REGEXP '$q') ";
            $query = $query . "ORDER BY r.date_create DESC LIMIT $limit OFFSET $offset ";
			$this->get_list($query);
		}

		private function recipe(){
			if($this->get_request_method() != "GET") $this->response('',406);

			$id = (int)$this->_request['id'];
			$query="SELECT distinct r.id, r.name, r.instruction, r.duration, r.image, r.category, r.date_create FROM recipe r WHERE r.id=$id";
			$this->get_one($query);
		}

		private function insertRecipe(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
			$this->checkAuthorization();
			$data = json_decode(file_get_contents("php://input"), true);
			if(!isset($data) ) $this->responseInvalidParam();
		
			$column_names = array('name', 'instruction', 'duration', 'image', 'category','date_create');
			$table_name = 'recipe';
			$this->post_one($data, $column_names, $table_name);
		}

		private function updateRecipe(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
			$this->checkAuthorization();
			$data = json_decode(file_get_contents("php://input"),true);
			if(!isset($data['id']))$this->responseInvalidParam();
			
			$id = (int)$data['id'];
			$column_names = array('name', 'instruction', 'duration', 'image', 'category', 'date_create');
			$table_name = 'recipe';
			$this->post_update($id, $data, $column_names, $table_name);
		}

		private function deleteRecipe(){
			if($this->get_request_method() != "DELETE"){
				$this->response('',406);
			}
			$this->checkAuthorization();
			if(!isset($this->_request['id'])) $this->responseInvalidParam();
		
			$id = (int)$this->_request['id'];
			$table_name = 'recipe';
			$this->delete_one($id, $table_name);
		}

		/*
		 * CATEGORY TRANSACTION  --------------------------------------------------------------------------------------------------------------------
		 */
		private function listCategories(){
			if($this->get_request_method() != "GET") $this->response('',406);
			$limit = isset($this->_request['count']) ? ((int)$this->_request['count']) : 10;
			$page = isset($this->_request['page']) ? ((int)$this->_request['page']) : 1;
			
			$offset = ($page * $limit) - $limit;
			$count_total = $this->get_count_result("SELECT COUNT(DISTINCT c.id) FROM category c");
			$query = "SELECT DISTINCT c.id, c.name, c.banner, c.description, COUNT(DISTINCT r.id) as recipes
					  FROM category c LEFT JOIN recipe r ON c.id = r.category GROUP BY c.id ORDER BY c.name DESC LIMIT $limit OFFSET $offset";
			$categories = $this->get_list_result($query);
			$count = count($categories);
			$respon = array(
				'status' => 'success', 'count' => $count, 'count_total' => $count_total, 'pages' => $page, 'categories' => $categories
			);
			$this->response($this->json($respon), 200);
		}
		
		private function categories(){
			if($this->get_request_method() != "GET") $this->response('',406);
			$query="SELECT DISTINCT c.id, c.name, c.banner, c.description, COUNT(DISTINCT r.id) as recipes
					FROM category c LEFT JOIN recipe r ON c.id = r.category GROUP BY c.id ORDER BY c.name DESC";
			$this->get_list($query);
		}

		private function categoriesSimple(){
            if($this->get_request_method() != "GET") $this->response('',406);
            $query="SELECT c.id, c.name FROM category c ORDER BY c.name DESC";
            $this->get_list($query);
        }

		private function categoriesByPage(){
			if($this->get_request_method() != "GET") $this->response('',406);

            $q = (isset($this->_request['q'])) ? ($this->_request['q']) : "";
			$limit = (int)$this->_request['limit'];
			$offset = ((int)$this->_request['page']) - 1;
			
			$query="SELECT DISTINCT c.id, c.name, c.banner, c.description, COUNT(DISTINCT r.id) as recipes
					FROM category c LEFT JOIN recipe r ON c.id = r.category ";

            if($q != "") $query = $query . "WHERE c.name REGEXP '$q' OR c.description REGEXP '$q' " ;
            $query = $query . "GROUP BY c.id ORDER BY r.date_create DESC LIMIT $limit OFFSET $offset ";
			$this->get_list($query);
		}
		
		private function categoriesCount(){
			if($this->get_request_method() != "GET") $this->response('',406);
			$q = (isset($this->_request['q'])) ? ($this->_request['q']) : "";
            $query="SELECT COUNT(DISTINCT c.id) FROM category c ";
            if($q != "") $query = $query . "WHERE c.name REGEXP '$q' OR c.description REGEXP '$q' " ;
			$this->get_count($query);
		}
		
		private function category(){
			if($this->get_request_method() != "GET") $this->response('',406);

			$id = (int)$this->_request['id'];
			$query="SELECT distinct c.id, c.name, c.banner, c.description FROM category c WHERE c.id=$id";
			$this->get_one($query);
		}

		private function insertCategory(){
			if($this->get_request_method() != "POST"){
				$this->response('', 406);
			}
			$this->checkAuthorization();
			$data = json_decode(file_get_contents("php://input"), true);
			if(!isset($data)) $this->responseInvalidParam();
			
			$column_names = array('name', 'banner', 'description');
			$table_name = 'category';
			$this->post_one($data, $column_names, $table_name);
		}

		private function updateCategory(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
			$this->checkAuthorization();
			$data = json_decode(file_get_contents("php://input"),true);
			if(!isset($data['id'])) $this->responseInvalidParam();
			
			$id = (int)$data['id'];
			$column_names = array('name', 'banner', 'description');
			$table_name = 'category';
			$this->post_update($id, $data, $column_names, $table_name);
		}

		private function deleteCategory(){
			if($this->get_request_method() != "DELETE") $this->response('',406);
			$this->checkAuthorization();
			if(!isset($this->_request['id'])) $this->responseInvalidParam();
			
			$id = (int)$this->_request['id'];
			$table_name = 'category';
			$this->delete_one($id, $table_name);
		}

		/*
		 * GCM TRANSACTION -------------------------------------------------------------------------------------------------------
		 */
		private function gcms(){
			if($this->get_request_method() != "GET")$this->response('',406);
			$query="SELECT distinct g.id, g.device, g.email, g.version, g.regid, g.date_create 
					FROM gcm g ORDER BY g.date_create DESC";
			$this->get_list($query);
		}
		
		private function gcmsByPage(){
			if($this->get_request_method() != "GET") $this->response('',406);

            $q = (isset($this->_request['q'])) ? ($this->_request['q']) : "";
			$limit = (int)$this->_request['limit'];
			$offset = ((int)$this->_request['page']) - 1;
			
			$query="SELECT distinct g.* FROM gcm g ";
            if($q != "") $query = $query . "WHERE g.device REGEXP '$q' OR g.email REGEXP '$q' OR g.version REGEXP '$q' " ;
            $query = $query . "ORDER BY g.date_create DESC LIMIT $limit OFFSET $offset ";

			$this->get_list($query);
		}
		
		private function gcmsCount(){
			if($this->get_request_method() != "GET") $this->response('',406);
            $q = (isset($this->_request['q'])) ? ($this->_request['q']) : "";

			$query="SELECT COUNT(DISTINCT g.regid) FROM gcm g ";
            if($q != "") $query = $query . "WHERE g.device REGEXP '$q' OR g.email REGEXP '$q' OR g.version REGEXP '$q' " ;

			$this->get_count($query);
		}

		private function allGcmId(){
			$query="SELECT distinct g.regid FROM gcm g";
			return $this->get_list_result($query);
		}

		private function insertGcm(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
			$gcm = json_decode(file_get_contents("php://input"),true);
			$regid = $gcm['regid'];
			$device = $gcm['device'];
			$email = $gcm['email'];

			$column_names = array('device', 'email', 'version', 'regid', 'date_create');
			$table_name = 'gcm';
			$query="SELECT distinct g.id FROM gcm g WHERE (g.regid='$regid') OR (g.device='$device' AND g.email='$email')";
			$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
			if($r->num_rows > 0){ // update
				$result = $r->fetch_assoc();
				$id = (int)$result['id'];
				$new_gcm['id'] = $id;
				$new_gcm['gcm'] = $gcm;
				$this-> post_update($id, $new_gcm, $column_names, $table_name);
			}else{ // insert
				$this->post_one($gcm, $column_names, $table_name);
			}
		}

        private function sendNotif() {
            if($this->get_request_method() != "POST")$this->response('',406);
            $body = json_decode(file_get_contents("php://input"),true);

            $notif_title = $body['data']['title'];
            $notif_content = $body['data']['content'];

            if(self::demo_version){
                $m = array('status' => "failed", "msg" => "Ops, this is demo version", "data" => null);
                $this->response($this->json($m),200);
            }

            $array_regid = $this->allGcmId();
            $registration_ids = array();
            foreach($array_regid as $r){
                array_push($registration_ids, $r['regid']);
            }

            $gcmRegIds = array();
            $i = 0;
            // split gcm reg id per 1000 item
            foreach($registration_ids as $reg_id){
                $i++;
                $gcmRegIds[floor($i/1000)][] = $reg_id;
            }
            // send notif per 1000 items
            $pushStatus = array();
            foreach($gcmRegIds as $val){
                $pushStatus[] = $this->sendPushNotification($val, $notif_title, $notif_content);
            }

            $success_count = 0;
            $failure_count = 0;
            foreach($pushStatus as $s){
                if(!empty($s['success'])) $success_count = $success_count + $s['success'];
                if(!empty($s['failure'])) $failure_count = $failure_count + ($s['failure']);
            }

            $obj_data = array();
            if(!empty($pushStatus)){
                $obj_data['success'] = $success_count;
                $obj_data['failure'] = $failure_count;
                $resp['data'] = $obj_data;
                $this->response($this->json($resp), 200);
            }else{
                $this->response('',204);	// "No Content" status
            }
        }

        private function sendPushNotification($registration_ids, $title, $content){
            // Set POST variables
            $url = 'https://fcm.googleapis.com/fcm/send';
            $fields = array(
                'registration_ids' => $registration_ids,
                'data' => array( 'title' => $title, 'content' => $content, )
            );
            $api_key = self::GOOGLE_API_KEY;
            $headers = array( 'Authorization: key='.$api_key, 'Content-Type: application/json' );
            // Open connection
            $ch = curl_init();

            // Set the url, number of POST vars, POST data
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            // Disabling SSL Certificate support temporarly
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $this->json($fields));
            // Execute post
            $result = curl_exec($ch);
            if ($result === FALSE) { die('Curl failed: ' . curl_error($ch)); }
            // Close connection
            curl_close($ch);
            $result_data = json_decode($result);
            $result_arr = array();
            $result_arr['success'] = $result_data->success;
            $result_arr['failure'] = $result_data->failure;
            return $result_arr;
        }

		/*
		 * FILE TRANSACTION ----------------------------------------------------------------------------------------------------------------
		 */
		private function getBase64(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
			$data = file_get_contents("php://input");
			$type = 'jpg';
			$base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
			if(!empty($data)){
				$success = array('status' => "Success", "msg" => "Successfully.", "data" => $base64);
				$this->response($this->json($success), 200);
			}else{
				$this->response('',204);	// "No Content" status
			}
		}

		private function uploadFileToUrl(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
			//$file_name = $_POST['file_name'];
			print_r($_POST);
			$values = array_values($_POST);
			//$file_name = $_FILES['file_contents'];

			//$file_name = $this->_request['file_name'];

			$success = array('status' => "Success", "msg" => "Successfully.", "data" => null);
			$this->response($this->json($success), 200);
		}

		/*
		 * ======================================================================================================
		 * =============================== API utilities # DO NOT EDIT ==========================================
		 */

		private function get_list($query){
			$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
			if($r->num_rows > 0){
				$result = array();
				while($row = $r->fetch_assoc()){
					$result[] = $row;
				}
				$this->response($this->json($result), 200); // send user details
			}
			$this->response('',204);	// If no records "No Content" status
		}
		
		private function get_list_result($query){
			$result = array();
			$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
			if($r->num_rows > 0){
				while($row = $r->fetch_assoc()){
					$result[] = $row;
				}
			}
			return $result;
		}

		private function get_one($query){
			$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
			if($r->num_rows > 0) {
				$result = $r->fetch_assoc();
				$this->response($this->json($result), 200); // send user details
			}
			$this->response('',204);	// If no records "No Content" status
		}
		
		private function get_count($query){
			$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
			if($r->num_rows > 0) {
				$result = $r->fetch_row();
				$this->response($result[0], 200); 
			}
			$this->response('',204);	// If no records "No Content" status
		}
		
		private function get_count_result($query){
			$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
			if($r->num_rows > 0) {
				$result = $r->fetch_row();
				return $result[0];
			}
			return 0;
		}
		
		private function post_one($obj, $column_names, $table_name){
			$keys 		= array_keys($obj);
			$columns 	= '';
			$values 	= '';
			foreach($column_names as $desired_key){ // Check the recipe received. If blank insert blank into the array.
			  if(!in_array($desired_key, $keys)) {
			   	$$desired_key = '';
				}else{
					$$desired_key = $obj[$desired_key];
				}
				$columns 	= $columns.$desired_key.',';
				$values 	= $values."'".$this->real_escape($$desired_key)."',";
			}
			$query = "INSERT INTO ".$table_name."(".trim($columns,',').") VALUES(".trim($values,',').")";
			//echo "QUERY : ".$query;
			if(!empty($obj)){
				//$r = $this->mysqli->query($query) or trigger_error($this->mysqli->error.__LINE__);
				if ($this->mysqli->query($query)) {
					$status = "success";
			    $msg 		= $table_name." created successfully";
				} else {
					$status = "failed";
			    $msg 		= $this->mysqli->error.__LINE__;
				}
				$resp = array('status' => $status, "msg" => $msg, "data" => $obj);
				$this->response($this->json($resp),200);
			}else{
				$this->response('',204);	//"No Content" status
			}
		}

		private function post_update($id, $obj, $column_names, $table_name){
			$keys = array_keys($obj[$table_name]);
			$columns = '';
			$values = '';
			foreach($column_names as $desired_key){ // Check the recipe received. If key does not exist, insert blank into the array.
			  if(!in_array($desired_key, $keys)) {
			   	$$desired_key = '';
				}else{
					$$desired_key = $obj[$table_name][$desired_key];
				}
				$columns = $columns.$desired_key."='".$this->real_escape($$desired_key)."',";
			}
			$query = "UPDATE ".$table_name." SET ".trim($columns,',')." WHERE id=$id";
			if(!empty($obj)){
				// $r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				if ($this->mysqli->query($query)) {
					$status = "success";
					$msg 	= $table_name." update successfully";
				} else {
					$status = "failed";
					$msg 	= $this->mysqli->error.__LINE__;
				}
				$resp = array('status' => $status, "msg" => $msg, "data" => $obj);
				$this->response($this->json($resp),200);
			}else{
				$this->response('',204);	// "No Content" status
			}
		}

		private function delete_one($id, $table_name){
			if($id > 0){
				$query="DELETE FROM ".$table_name." WHERE id = $id";
				if ($this->mysqli->query($query)) {
					$status = "success";
			    $msg 		= "One record " .$table_name." successfully deleted";
				} else {
					$status = "failed";
			    $msg 		= $this->mysqli->error.__LINE__;
				}
				$resp = array('status' => $status, "msg" => $msg);
				$this->response($this->json($resp),200);
			}else{
				$this->response('',204);	// If no records "No Content" status
			}
		}
		
		private function responseInvalidParam(){
			$resp = array("status" => 'Failed', "msg" => 'Invalid Parameter' );
			$this->response($this->json($resp), 200);
		}

		/* ==================================== End of API utilities ==========================================
		 * ====================================================================================================
		 */

		/* Encode array into JSON */
		private function json($data){
			if(is_array($data)){
				return json_encode($data, JSON_NUMERIC_CHECK);
			}
		}

		/* String mysqli_real_escape_string */
		private function real_escape($s){
			return mysqli_real_escape_string($this->mysqli, $s);
		}
	}

	// Initiiate Library

	$api = new API;
	$api->processApi();
?>
