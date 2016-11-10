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

	*/

  var taskRoute = router.route('/tasks');
  
  taskRoute.get(function(req, res) {
    res.json([{ "name": "alice", "height": 12 }, { "name": "jane", "height": 13 }]);
  });

  return router;
}


