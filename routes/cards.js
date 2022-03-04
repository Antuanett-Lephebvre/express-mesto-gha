const router = require('express').Router();

module.exports = router;
const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

const {
  validationCardId,
  validationCreateCard,
} = require('../middlewares/validation');

router.get('/cards', getCards);
router.post('/cards', validationCreateCard, createCard);
router.delete('/cards/:cardId', validationCardId, deleteCard);
router.put('/cards/:cardId/likes', validationCardId, likeCard);
router.delete('/cards/:cardId/likes', validationCardId, dislikeCard);
module.exports = router;
