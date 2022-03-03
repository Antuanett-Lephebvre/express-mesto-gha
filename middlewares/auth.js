const jwt = require('jsonwebtoken');
const BadAuth = require('../errors/BadAuth');

const auth = (req, res, next) => {
  if (!req.cookies.jwt) {
    next(new BadAuth('Авторизация не прошла'));
  } else {
    const token = req.cookies.jwt;
    let payload;

    try {
      payload = jwt.verify(token, 'secret-key');
    } catch (err) {
      next(new BadAuth('Авторизация не прошла'));
    }
    req.user = payload;
    next();
  }
};

module.exports = auth;
