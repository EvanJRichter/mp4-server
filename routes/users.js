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
		where = req.query.where;
		limit = req.query.limit;
		skip =  req.query.skip;
		sort = req.query.sort;
		select = req.query.select;

		if(req.query.count && req.query.count === "true"){
			User.count(where).skip(skip).limit(limit).sort(sort).select(select).exec(function (err, users) {
				if (err){
					res.status(200).send({
						message: err,
						data: users
					});
				}
				else {
					res.status(200).send({
						message: "OK",
						data: users
					});
				}
		  	});		
		}
		else {
			User.find(where).skip(skip).limit(limit).sort(sort).select(select).exec(function (err, users) {
				if (err){
					res.status(200).send({
						message: err,
						data: users
					});
				}
				else {
					res.status(200).send({
						message: "OK",
						data: users
					});
				}
    		});
		}

	});

	userRoute.post(function(req, res) {	  	
	  	if (!req.body.name || !req.body.email){
			res.status(200);
			res.json({"data": "User POST Request Error", "message": "Must provide both email and name to create user."});
			res.end();
			return;
	  	}
	  	User.count({"email":req.body.email}).exec(function (err, users) { //check if there is a user with existing email
	  		response = handleMongoResponse(err, users);

		    if (response.message === "OK" && parseInt(response.data) == 0){
		    	var user = new User({
		    		name: req.body.name, 
		    		email: req.body.email, 
		    		pendingTasks: req.body.pendingTasks
		    	});
				// Save it to database
				user.save(function(err, user){
				   	res.status(201);
				    res.json(handleMongoResponse(err, user));
    				res.end();
				});
		    }
		    else {
		    	res.status(200);
		    	res.json({"data": "User POST Request Error", "message": "Email must be valid and unique"});
    			res.end();
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
		User.findById(req.query.id, function (err, user) {
			mongoResponse = handleMongoResponse(err, user)
			if (mongoResponse.message === "OK" && user != null){
				res.status(200);
				res.json(mongoResponse); 
			}
			else {
				res.status(404);
				res.json({"data":[], "message":"User Not Found"}); 
			}
			res.end();	
	  	});
	});

	userIdRoute.put(function(req, res) { 
		var newUserVals = {};
		newUserVals.name = req.body.name;
		newUserVals.email = req.body.email;
		newUserVals.pendingTasks = req.body.pendingTasks;
		User.findByIdAndUpdate(req.params.id, newUserVals, function (err, user) {
		    mongoResponse = handleMongoResponse(err, user)
			if (mongoResponse.message === "OK"){
				res.status(200);
				res.json(mongoResponse); 
			}
			else {
				res.status(404);
				res.json({"data":[], "message":"User Not Found"}); 
			}
			res.end();	
	  	});
	});

	userIdRoute.delete(function(req, res) { 
		User.findByIdAndRemove(req.params.id, function (err, user) {
			if (err){
				res.status(404).send({
					message: "User not found",
					data: []
				});
			}
			else if (user === null){
				res.status(404).send({
					message: "User not found",
					data: []
				});
			}
			else {
				res.status(200).send({
					message: "User deleted",
					data: []
				});
			}
	  	});
	});
	

	return router;
}


