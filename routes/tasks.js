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
		if(req.query["where"]){
			where = JSON.parse(req.query["where"]);
		}
		if(req.query["limit"]){
			limit = parseInt(req.query["limit"]);
		}
		if(req.query["skip"]){
			skip = parseInt(req.query["skip"]);
		}
		if(req.query["sort"]){
			sort = JSON.parse(req.query["sort"]);
		}
		if(req.query["select"]){
			select = JSON.parse(req.query["select"]);
		}
		if(req.query["count"] && req.query["count"] === "true"){
			Task.count(where).skip(skip).limit(limit).sort(sort).select(select).exec(function (err, tasks) {
			    res.json(handleMongoResponse(err, tasks));
		  	});		
		}
		else {
			Task.find(where).skip(skip).limit(limit).sort(sort).select(select).exec(function (err, tasks) {
			    res.json(handleMongoResponse(err, tasks));
		  	});
		}

	});

	taskRoute.post(function(req, res) {	  	
	  	if (!req.query["name"] || !req.query["deadline"]){
			res.json({"data": "Task POST Request Error", "message": "Must provide both deadline and name to create task."});
	  	}
    	var task = new Task({
    		name: req.query["name"], 
    		deadline:  req.query["deadline"], 
    		description:  req.query["description"],
    		completed:  req.query["completed"],
    		assignedUser:  req.query["assignedUser"],
    		assignedUserName:  req.query["assignedUserName"]
    	});

		// Save it to database
		task.save(function(err, task){
		    res.json(handleMongoResponse(err, task));
		});
	});

	taskRoute.options(function(req, res){
    	res.writeHead(200);
    	res.end();
	});


	/* ---- Requests with ID attached ---- */

	var taskIdRoute = router.route('/tasks/:id');
	
	taskIdRoute.get(function(req, res) {
		Task.findById(req.params.id, function (err, task) {
			res.json(handleMongoResponse(err, task));
	  	});
	});

	taskIdRoute.put(function(req, res) {
		var newTaskVals = {};
		if (req.query["name"]){
			newTaskVals.name = JSON.parse(req.query["name"]);
		}
		if (req.query["deadline"]){
			newTaskVals.email = JSON.parse(req.query["deadline"]);
		}
		if (req.query["description"]){
			newTaskVals.pendingTasks = JSON.parse(req.query["description"]);
		}
		if (req.query["completed"]){
			newTaskVals.pendingTasks = JSON.parse(req.query["completed"]);
		}
		if (req.query["assignedUser"]){
			newTaskVals.pendingTasks = JSON.parse(req.query["assignedUser"]);
		}
    	if (req.query["assignedUserName"]){
			newTaskVals.pendingTasks = JSON.parse(req.query["assignedUserName"]);
		}

		Task.findByIdAndUpdate(req.params.id, newTaskVals, function (err, task) {
		    res.json(handleMongoResponse(err, task));
	  	});
	});

	taskIdRoute.delete(function(req, res) {
		Task.findByIdAndRemove(req.params.id, function (err, task) {
		    res.json(handleMongoResponse(err, task));
	  	});
	});
	

	return router;
}


