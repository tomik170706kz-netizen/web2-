const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { getAllUsers, updateUserEmail } = require('../controllers/userController');
const { admin } = require('../middleware/authMiddleware');

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// admin endpoints
router.get('/', protect, admin, getAllUsers);
router.put('/:id/email', protect, admin, updateUserEmail);

module.exports = router;