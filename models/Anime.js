const mongoose = require('mongoose');

const animeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  title: { type: String, required: true },
  status: { type: String, required: true, enum: ['Watching', 'Completed', 'Plan to Watch'], default: 'Plan to Watch' },
  rating: { type: Number, min: 1, max: 10 },
  episodesWatched: { type: Number, default: 0 },
  imageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Anime', animeSchema);