const Card = require('../models/card');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send({ data: cards }))
    .catch((err) => {
      res.status(500).send({ message: `На сервере произошла ошибка: ${err}` });
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные в методы создания карточки' });
      } else {
        res.status(500).send({ message: `На сервере произошла ошибка: ${err}` });
      }
    });
};

const deleteCard = (req, res) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        return res.status(404).send({ message: 'Карточка не найдена' });
      }
      Card.findOneAndRemove(cardId)
        .then((currentCard) => {
          if (!currentCard) {
            return res.status(404).send({ message: 'Нет данных' });
          }
          return res.status(200).send({ message: 'Карточка удалена' });
        })
        .catch((err) => {
          if (err.name === 'CastError') {
            res.status(400).send({ message: 'Переданы некорректные данные в методы удалении карточки' });
          } else {
            res.status(500).send({ message: `На сервере произошла ошибка: ${err}` });
          }
        });
      return res.status(200).send({ message: 'Карточка передана в удаление' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Переданы некорректные данные в методы удалении карточки' });
      } else {
        res.status(500).send({ message: `На сервере произошла ошибка: ${err}` });
      }
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({ message: 'Нет данных' });
      }
      return res.status(200).send({ message: 'Лайк поставлен' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Передан невалидный id для лайка' });
      } else {
        res.status(500).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({ message: 'Нет данных' });
      }
      return res.status(200).send({ message: 'Лайк убран' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Передан невалидный _id пользователя' });
      } else {
        res.status(500).send({ message: `На сервере произошла ошибка: ${err}` });
      }
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
