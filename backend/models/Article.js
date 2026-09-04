const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 220 },
  category: { type: String, required: true, trim: true, index: true },
  summary: { type: String, required: true, trim: true, maxlength: 500 },
  content: { type: String, required: true },
  author: { type: String, required: true, trim: true },
  publishedAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
}, { versionKey: false });

module.exports = mongoose.model('Article', articleSchema);
