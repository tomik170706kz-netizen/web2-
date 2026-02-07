const Anime = require('../models/Anime');

exports.addAnime = async (req, res) => {
  try {
    const { title, status, rating, episodesWatched, imageUrl } = req.body;
    const anime = await Anime.create({
      user: req.user._id,
      title, status, rating, episodesWatched, imageUrl
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

exports.updateAnime = async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);
    if (anime && anime.user.toString() === req.user._id.toString()) {
      Object.assign(anime, req.body);
      const updated = await anime.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Anime not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAnime = async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);
    if (anime && anime.user.toString() === req.user._id.toString()) {
      await anime.deleteOne();
      res.json({ message: 'Anime removed' });
    } else {
      res.status(404).json({ message: 'Anime not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};