// Load required packages
var mongoose = require('mongoose');
var secrets = require('../config/secrets');

// Connect to MongoDB and create/use database called todoAppTest
mongoose.connect(secrets.mongo_connection);

// Define our user schema
var UserSchema   = new mongoose.Schema({
  name: String,
  email: String,
  pendingTasks: [String],
  dateCreated: { type: Date, default: Date.now }
});

// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);
