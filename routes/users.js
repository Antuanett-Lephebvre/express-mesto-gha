const router = require('express').Router();

module.exports = router;
const {
  getUsers,
  getUser,
  updateProfile,
  updateAvatar,
  getCurrentUser,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/:userId', getUser);
router.patch('/me', updateProfile);
router.get('/me', getCurrentUser);
router.patch('/me/avatar', updateAvatar);

module.exports = router;
