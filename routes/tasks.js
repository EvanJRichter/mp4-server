var secrets = require('../config/secrets');
var Task = require('../models/task');

module.exports = function(router) {

	/*

	tasks	GET	Respond with a List of tasks
 			POST	Create a new task. Respond with details of new task
 			OPTIONS	See the last tip at the bottom of the page

	tasks/:id	GET	Respond with details of specified task or 404 error
 			PUT	Replace entire task with supplied task or 404 error
 			DELETE	Delete specified user or 404 error

	where	filter results based on JSON query
	sort	specify the order in which to sort each specified field (1- ascending; -1 - descending)
	select	specify the set of fields to include or exclude in each document (1 - include; 0 - exclude)
	skip	specify the number of results to skip in the result set; useful for pagination
	limit	specify the number of results to return (default should be 100 for tasks and unlimited for users)
	count	if set to true, return the count of documents that match the query (instead of the documents themselves)

	Tasks cannot be created (or updated) without a name or a deadline. All other fields that the user did not specify should be set to reasonable values.


	“name” - String
	“description” - String
	“deadline” - Date
	“completed” - Boolean
	“assignedUser” - String - The _id field of the user this task is assigned to - default “”
	“assignedUserName” - String - The name field of the user this task is assigned to - default “unassigned”
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

	/* ---- General Task Requests ---- */

  	var taskRoute = router.route('/tasks');

	taskRoute.get(function(req, res) {
		var where = {};
		var limit = 100; 
		var skip = 0; 
		var sort = {};
		var select = {};
		var count = {};
		where = eval('(' + req.query.where + ')');
		limit = eval('(' + req.query.limit + ')');
		skip =  eval('(' + req.query.skip + ')');
		sort = eval('(' + req.query.sort + ')');
		select = eval('(' + req.query.select + ')');
		count = eval('(' + req.query.count + ')');

		if(req.query.count && req.query.count === "true"){
			Task.count(where).skip(skip).limit(limit).sort(sort).select(select).exec(function (err, tasks) {
				if (err){
					res.status(200).send({
						message: err,
						data: tasks
					});
				}
				else {
					res.status(200).send({
						message: "OK",
						data: tasks
					});
				}
		  	});		
		}
		else {
			Task.find(where).skip(skip).limit(limit).sort(sort).select(select).exec(function (err, tasks) {
				if (err){
					res.status(200).send({
						message: err,
						data: tasks
					});
				}
				else {
					res.status(200).send({
						message: "OK",
						data: tasks
					});
				}
		  	});
		}

	});

	taskRoute.post(function(req, res) {	  	
	  	if (!req.body.name || !req.body.deadline){
			res.json({"data": "Task POST Request Error", "message": "Must provide both deadline and name to create task."});
	  	}
    	var task = new Task({
    		name: req.body.name, 
    		deadline:  req.body.deadline, 
    		description:  req.body.description,
    		completed:  req.body.completed,
    		assignedUser:  req.body.assignedUser,
    		assignedUserName:  req.body.assignedUserName
    	});

		// Save it to database
		task.save(function(err, task){
			if (err){
				res.status(200).send({
					message: err,
					data: task
				});
			}
			else {
				res.status(201).send({
					message: "OK",
					data: task
				});
			}
		});
	});

	taskRoute.options(function(req, res){
    	res.writeHead(200);
    	res.end();
	});


	/* ---- Requests with ID attached ---- */

	var taskIdRoute = router.route('/tasks/:id');
	
	taskIdRoute.get(function(req, res) {
		var select =  eval('(' + req.query.select + ')');
		Task.find({"_id":req.params.id}).select(select).exec(function (err, task) {
			if (err){
				res.status(404).send({
					message: "Task not found",
					data: []
				});
			}
			else if (task === null || task.length == 0){
				res.status(404).send({
					message: "Task not found",
					data: []
				});
			}
			else {
				res.status(200).send({
					message: "OK",
					data: task[0]
				});
			}		
	  	});
	});

	taskIdRoute.put(function(req, res) {
		var newTaskVals = {};
		newTaskVals.name = req.body.name;
		newTaskVals.email = req.body.deadline;
		newTaskVals.description = req.body.description;
		newTaskVals.completed = req.body.completed;
		newTaskVals.assignedUser = req.body.assignedUser;
		newTaskVals.assignedUserName = req.body.assignedUserName;

		Task.findByIdAndUpdate(req.params.id, newTaskVals, function (err, task) {
		    res.status(200);
			mongoResponse = handleMongoResponse(err, task)
			if (mongoResponse.message === "OK" && task != null){
				res.status(200);
				res.json(mongoResponse); 
			}
			else {
				res.status(404);
				res.json({"data":[], "message":"Task Not Found"}); 
			}
	  		res.end();
	  	});
	});

	taskIdRoute.delete(function(req, res) {
		Task.findByIdAndRemove(req.params.id, function (err, task) {
			mongoResponse = handleMongoResponse(err, task)
			if (mongoResponse.message === "OK" && task != null){
				res.status(200);
				res.json(mongoResponse); 
			}
			else {
				res.status(404);
				res.json({"data":[], "message":"Task Not Found"}); 
			}
			res.end();	
	  	});
	});
	

	return router;
}


