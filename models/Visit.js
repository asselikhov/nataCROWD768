const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  userId: Number,
  username: String,
  timestamp: Date
});

module.exports = mongoose.model('Visit', VisitSchema);