var secrets = require('../config/secrets');
var User = require('../models/user');

module.exports = function(router) {

	/*

	CONTRACT:

	users		GET	Respond with a List of users
 				POST	Create a new user. Respond with details of new user
 				OPTIONS	See the last tip at the bottom of the page

	users/:id	GET	Respond with details of specified user or 404 error
 				PUT	Replace entire user with supplied user or 404 error
 				DELETE	Delete specified user or 404 error

 	where	filter results based on JSON query
	sort	specify the order in which to sort each specified field (1- ascending; -1 - descending)
	select	specify the set of fields to include or exclude in each document (1 - include; 0 - exclude)
	skip	specify the number of results to skip in the result set; useful for pagination
	limit	specify the number of results to return (default should be 100 for tasks and unlimited for users)
	count	if set to true, return the count of documents that match the query (instead of the documents themselves)


	Users cannot be created (or updated) without a name or email. All other fields that the user did not specify should be set to reasonable values.
	Multiple users with the same email cannot exist.

	*/
	var handleMongoResponse = function (err, data){
		var response = {};
		if (err) {
	    	response.data = err;
	    	response.message = err.message;
	    } 
	    else {
	    	response.data = data;
	    	response.message = "OK";
	    }
	    return response;
	}

	/* ---- General User Requests ---- */

	var userRoute = router.route('/users');

	userRoute.get(function(req, res) {
		var where = {};
		var limit = 1000; //unlimited for users
		var skip = 0; 
		var sort = {};
		var select = {};
		if(req.query["where"]){
			where = JSON.parse(req.query["where"]);
		}
		if(req.query["limit"]){
			limit = parseInt(req.query["limit"]);
		}
		if(req.query["skip"]){
			skip = parseInt(req.query["skip"]);
			console.log(skip);
		}
		if(req.query["sort"]){
			sort = JSON.parse(req.query["sort"]);
		}
		if(req.query["select"]){
			select = JSON.parse(req.query["select"]);
		}
		if(req.query["count"] && req.query["count"] === "true"){
			User.count(where).skip(skip).limit(limit).sort(sort).select(select).exec(function (err, users) {
			    res.json(handleMongoResponse(err, users));
		  	});		
		}
		else {
			User.find(where).skip(skip).limit(limit).sort(sort).select(select).exec(function (err, users) {
			    res.json(handleMongoResponse(err, users));
		  	});
		}

	});

	userRoute.post(function(req, res) {	  	
	  	if (!req.query["name"] && !req.query["email"]){
			res.json({"data": "User POST Request Error", "message": "Must provide both email and name to create user."});
	  	}
	  	User.count({"email":req.query["email"]}).exec(function (err, users) { //check if there is a user with existing email
	  		response = handleMongoResponse(err, users);
		    if (response.message === "OK" && parseInt(response.data) == 0){
		    	var user = new User({name: req.query["name"], email: req.query["email"], pendingTasks: req.query["pendingTasks"]});
				// Save it to database
				user.save(function(err, user){
				    res.json(handleMongoResponse(err, user));
				});
		    }
		    else {
		    	res.json({"data": "User POST Request Error", "message": "Email must be valid and unique"});
		    }
	  	});	


	});

	userRoute.options(function(req, res){
    	res.writeHead(200);
    	res.end();
	});


	/* ---- Requests with ID attached ---- */
	var userIdRoute = router.route('/users/:id');
	
	userIdRoute.get(function(req, res) {
		User.findById(req.params.id, function (err, user) {
			res.json(handleMongoResponse(err, user));
	  	});
	});

	userIdRoute.put(function(req, res) {
		var newUserVals = {};
		if (req.query["name"]){
			newUserVals.name = (req.query["name"]);
		}
		if (req.query["email"]){
			newUserVals.email = (req.query["email"]);
		}
		if (req.query["pendingTasks"]){
			newUserVals.pendingTasks = (req.query["pendingTasks"]);
		}
		console.log(newUserVals);
		User.findByIdAndUpdate(req.params.id, newUserVals, function (err, user) {
		    res.json(handleMongoResponse(err, user));
	  	});
	});

	userIdRoute.delete(function(req, res) {
		User.findByIdAndRemove(req.params.id, function (err, user) {
		    res.json(handleMongoResponse(err, user));
	  	});
	});
	

	return router;
}


