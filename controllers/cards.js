const Card = require('../models/card');
const BadRequest = require('../errors/BadRequest');
const NotFound = require('../errors/NotFound');
const Forbidden = require('../errors/Forbidden');
const ServerError = require('../errors/ServerError');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send({ data: cards }))
    .catch(() => {
      throw new ServerError(
        'На сервере произошла ошибка',
      );
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequest(
          'Переданы некорректные данные в методы создания карточки',
        );
      } else {
        throw new ServerError(
          'На сервере произошла ошибка',
        );
      }
    });
};

const deleteCard = (req, res) => {
  const userId = req.user._id;
  const { cardId } = req.params;
  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFound('Карточка не найдена');
      }
      if (userId !== String(card.owner)) {
        throw new Forbidden('Недостаточно прав');
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
            throw new BadRequest(
              'Переданы некорректные данные в методы удалении карточки',
            );
          } else {
            throw new ServerError(
              'На сервере произошла ошибка',
            );
          }
        });
      return res.status(200).send({ message: 'Карточка передана в удаление' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest(
          'Переданы некорректные данные в методы удалении карточки',
        );
      } else {
        throw new ServerError(
          'На сервере произошла ошибка',
        );
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
        throw new NotFound('Нет данных');
      }
      return res.status(200).send({ message: 'Лайк поставлен' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest('Передан невалидный id пользователя');
      } else {
        throw new ServerError(
          'На сервере произошла ошибка',
        );
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
        throw new NotFound('Нет данных');
      }
      return res.status(200).send({ message: 'Лайк убран' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest('Передан невалидный id пользователя');
      } else {
        throw new ServerError(
          'На сервере произошла ошибка',
        );
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
