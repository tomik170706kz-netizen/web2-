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
