const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  section: String,
  text: String,
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Content', ContentSchema);