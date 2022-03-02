const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequest = require('../errors/BadRequest');
const BadAuth = require('../errors/BadAuth');
const NotFound = require('../errors/NotFound');
const BadUnique = require('../errors/BadUnique');
const ServerError = require('../errors/ServerError');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch(() => {
      throw new ServerError(
        'На сервере произошла ошибка',
      );
    });
};

const getUser = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new NotFound('Нет пользователя с таким id');
      }
      return res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest(
          'Невалидный id',
        );
      } else {
        throw new ServerError(
          'На сервере произошла ошибка',
        );
      }
    });
};

const createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!email || !password) {
    throw new BadRequest('Email или пароль могут быть пустыми');
  }
  User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new BadUnique('Пользователь существует');
      } else {
        bcrypt.hash(password, 10).then((hash) => {
          User.create({
            name,
            about,
            avatar,
            email,
            password: hash,
          })
            .catch((err) => {
              if (err.name === 'MongoError' && err.code === 11000) {
                throw new BadUnique(
                  'Пользователь с таким email уже существует',
                );
              }
            })
            .then((currentUser) => res.status(200).send({ currentUser: currentUser.toJSON() }))
            .catch((err) => {
              if (err.name === 'ValidationError') {
                throw new BadRequest(
                  'Переданы некорректные данные в методы создания пользователя',
                );
              } else {
                throw new ServerError(
                  'На сервере произошла ошибка',
                );
              }
            });
        });
      }
    });
};

const updateProfile = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequest(
          'Переданы некорректные данные в методы обновления профиля',
        );
      } else {
        throw new ServerError(
          'На сервере произошла ошибка',
        );
      }
    });
};

const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidations: true },
  )
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequest(
          'Переданы некорректные данные в методы обновления аватара',
        );
      } else {
        throw new ServerError(
          'На сервере произошла ошибка',
        );
      }
    });
};

const login = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new BadAuth('Нет пользователя с таким id');
      } else {
        bcrypt.compare(password, user.password, (error, isValid) => {
          if (error) {
            throw new BadAuth('Неверный запрос');
          }
          if (!isValid) {
            throw new BadAuth('Неправильный пароль');
          }
          if (isValid) {
            const token = jwt.sign(
              {
                _id: user._id,
              },
              'secret-key',
            );
            res
              .cookie('jwt', token, {
                maxAge: 3600000 * 24 * 7,
                httpOnly: true,
                sameSite: true,
              })
              .send({ message: 'Успешный вход' });
          }
        });
      }
    })
    .catch(() => {
      throw new BadAuth('Ошибка авторизации');
    })
    .catch(() => {
      throw new ServerError(
        'На сервере произошла ошибка',
      );
    });
};

const getCurrentUser = (req, res) => {
  const userId = req.user._id;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFound('Нет пользователя с таким id');
      }
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest(
          'Переданы некорректные данные в методы получения пользователя',
        );
      } else {
        throw new ServerError(
          'На сервере произошла ошибка',
        );
      }
    });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateProfile,
  updateAvatar,
  login,
  getCurrentUser,
};
