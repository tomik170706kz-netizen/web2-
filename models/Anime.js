const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 10, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const animeSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true },
  status: { type: String, enum: ['Watching', 'Completed', 'Plan to Watch'], default: 'Plan to Watch' },
  rating: { type: Number, min: 1, max: 10, default: 1 },
  episodesWatched: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categories: [{ type: String }],
  reviews: [reviewSchema]
}, { timestamps: true });

module.exports = mongoose.model('Anime', animeSchema);