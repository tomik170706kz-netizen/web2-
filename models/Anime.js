const mongoose = require('mongoose');

const animeSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Title is required'], 
        trim: true 
    },
    status: { 
        type: String, 
        enum: ['Watching', 'Completed', 'Plan to Watch'], 
        default: 'Plan to Watch' 
    },
    rating: { 
        type: Number, 
        min: 1, 
        max: 10, 
        default: 1 
    },
    episodesWatched: { 
        type: Number, 
        default: 0 
    },
    // Связь с юзером — самое важное!
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Anime', animeSchema);