const express = require('express');
const router = express.Router();

const { 
    addAnime, 
    getMyAnime, 
    getAnimeById, 
    updateAnime, 
    deleteAnime 
} = require('../controllers/animeController');
const { protect } = require('../middleware/authMiddleware');


router.route('/')
  .post(protect, addAnime)   
  .get(protect, getMyAnime); 

router.route('/:id')
  .get(protect, getAnimeById) 
  .put(protect, updateAnime)   
  .delete(protect, deleteAnime); 
module.exports = router;