const Anime = require('../models/Anime');
const Joi = require('joi'); 

exports.getAnimeById = async (req, res) => {
    try {
        const anime = await Anime.findById(req.params.id);
        if (!anime) return res.status(404).json({ message: "Anime not found" });
        
        if (anime.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }
        
        res.json(anime);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const animeValidationSchema = Joi.object({
    title: Joi.string().min(1).required(), 
    status: Joi.string().valid('Watching', 'Completed', 'Plan to Watch'),
    rating: Joi.number().min(1).max(10),
    episodesWatched: Joi.number().min(0),
    imageUrl: Joi.string().allow('', null)
});

const reviewSchema = Joi.object({
  rating: Joi.number().min(1).max(10).required(),
  comment: Joi.string().allow('', null)
});

// Public listing with optional category filter
exports.getPublicList = async (req, res) => {
  try {
    const { category, q } = req.query;
    const filter = {};
    if (category) filter.categories = category;
    if (q) filter.title = { $regex: q, $options: 'i' };

    const list = await Anime.find(filter).select('title status rating categories');
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Public details (read-only), includes reviews
exports.getAnimePublicById = async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id).populate('reviews.user', 'username');
    if (!anime) return res.status(404).json({ message: 'Anime not found' });

    // compute average rating from reviews if present
    const avgRating = anime.reviews && anime.reviews.length
      ? (anime.reviews.reduce((s, r) => s + r.rating, 0) / anime.reviews.length)
      : anime.rating || null;

    res.json({
      _id: anime._id,
      title: anime.title,
      status: anime.status,
      rating: avgRating,
      categories: anime.categories,
      reviews: anime.reviews
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addAnime = async (req, res) => {
  try {
    const { error } = animeValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, status, rating, episodesWatched, imageUrl } = req.body;
    
    const anime = await Anime.create({
      user: req.user._id, //
      title, 
      status, 
      rating, 
      episodesWatched, 
      imageUrl
    });
    
    res.status(201).json(anime);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMyAnime = async (req, res) => {
  try {
    const list = await Anime.find({ user: req.user._id });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAnimeById = async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);
    if (!anime) return res.status(404).json({ message: 'Anime not found' });

    if (anime.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this entry' });
    }

    res.json(anime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAnime = async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);
    if (!anime) return res.status(404).json({ message: 'Anime not found' });

    if (anime.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this entry' });
    }

    const { error } = animeValidationSchema.validate(req.body, { presence: 'optional' });
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { title, status, rating, episodesWatched, imageUrl } = req.body;

    if (title !== undefined) anime.title = title;
    if (status !== undefined) anime.status = status;
    if (rating !== undefined) anime.rating = rating;
    if (episodesWatched !== undefined) anime.episodesWatched = episodesWatched;
    if (imageUrl !== undefined) anime.imageUrl = imageUrl;

    const updated = await anime.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAnime = async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);
    if (!anime) return res.status(404).json({ message: 'Anime not found' });

    if (anime.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this entry' });
    }

await Anime.deleteOne({ _id: req.params.id });
    res.json({ message: 'Anime removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a review (authenticated)
exports.addReview = async (req, res) => {
  try {
    const { error } = reviewSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const anime = await Anime.findById(req.params.id);
    if (!anime) return res.status(404).json({ message: 'Anime not found' });

    // prevent multiple reviews by same user
    const already = anime.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ message: 'You have already reviewed this anime' });

    const review = { user: req.user._id, rating: req.body.rating, comment: req.body.comment };
    anime.reviews.push(review);
    await anime.save();

    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
