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

	*/

  var taskRoute = router.route('/tasks');
  
  taskRoute.get(function(req, res) {
    res.json([{ "name": "alice", "height": 12 }, { "name": "jane", "height": 13 }]);
  });

  return router;
}


