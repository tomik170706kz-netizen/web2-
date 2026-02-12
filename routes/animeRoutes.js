const express = require('express');
const router = express.Router();

const { 
    addAnime, 
    getMyAnime, 
    getAnimeById, 
    updateAnime, 
    deleteAnime,
    getPublicList,
    addReview,
    getAnimePublicById
} = require('../controllers/animeController');
const { protect } = require('../middleware/authMiddleware');


router.route('/')
  .post(protect, addAnime)   
  .get(protect, getMyAnime); 

// public listing with optional category filtering
router.get('/all', getPublicList);

router.route('/:id')
  .get(protect, getAnimeById) 
  .put(protect, updateAnime)   
  .delete(protect, deleteAnime); 

// public details and reviews
router.get('/public/:id', getAnimePublicById);
router.post('/:id/reviews', protect, addReview);
module.exports = router;