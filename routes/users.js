var secrets = require('../config/secrets');
var User = require('../models/user');

module.exports = function(router) {

	/*

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

	*/

	/* ---- General User Requests ---- */

	var userRoute = router.route('/users');

	userRoute.get(function(req, res) {
		User.find(function (err, users) {
		    if (err) return next(err);
		    res.json(users);
	  	});
	});

	userRoute.post(function(req, res) {
		//check if there is name and email first
	  	var user = new User({name: req.query["name"], email: req.query["email"], pendingTasks: req.query["pendingTasks"]});
		// Save it to database
		user.save(function(err, user){
		  if(err)
		    res.json({ "result": err});
		  else
		    res.json({"result": user});
		});
		
	});


	/* ---- Requests with ID attached ---- */
	var userIdRoute = router.route('/users/:id');
	
	userIdRoute.get(function(req, res) {
		console.log(req.params.id);
		User.findById(req.params.id, function (err, users) {
		    if (err) return next(err);
		    res.json(users);
	  	});
	});

	return router;
}


