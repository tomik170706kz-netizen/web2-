const express = require('express');
const router = express.Router();
const { addAnime, getMyAnime, updateAnime, deleteAnime } = require('../controllers/animeController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addAnime)
  .get(protect, getMyAnime);

router.route('/:id')
  .put(protect, updateAnime)
  .delete(protect, deleteAnime);

module.exports = router;