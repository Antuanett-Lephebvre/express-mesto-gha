const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequest = require('../errors/BadRequest');
const BadAuth = require('../errors/BadAuth');
const NotFound = require('../errors/NotFound');
const BadUnique = require('../errors/BadUnique');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch((err) => next(err));
};

const getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new NotFound('Нет пользователя с таким id');
      }
      return res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest(
          'Невалидный id',
        ));
      } else {
        next(err);
      }
    });
};

const createUser = (req, res, next) => {
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
              if (err.code === 11000) {
                next(new BadUnique(
                  'Пользователь с таким email уже существует',
                ));
              } else {
                next(err);
              }
            })
            .then((user) => res.status(200).send({
              data: {
                name, about, avatar, email,
              },
            }))
            .catch((err) => {
              if (err.name === 'ValidationError') {
                next(new BadRequest(
                  'Переданы некорректные данные в методы создания пользователя',
                ));
              } else {
                next(err);
              }
            });
        });
      }
    })
    .catch(next);
};

const updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest(
          'Переданы некорректные данные в методы обновления профиля',
        ));
      } else {
        next(err);
      }
    });
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidations: true },
  )
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest(
          'Переданы некорректные данные в методы обновления аватара',
        ));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
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
    .catch((err) => {
      if (err.code === 11000) {
        next(new BadAuth('Ошибка авторизации'));
      } else {
        next(err);
      }
    });
};

const getCurrentUser = (req, res, next) => {
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
        next(new BadRequest(
          'Переданы некорректные данные в методы получения пользователя',
        ));
      } else {
        next(err);
      }
    })
    .catch(next);
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
