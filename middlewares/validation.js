const { celebrate, Joi } = require('celebrate');

const validationUserId = celebrate({
  params: Joi.object().keys({
    id: Joi.string().length(24).hex(),
  }),
});

const validationUpdateProfile = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
});

const validationUpdateAvatar = celebrate({
  body: Joi.object().keys({
    avatar: Joi.string()
      .required()
      .pattern(
        /https?:\/\/(w{3}\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,300}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)/,
      ),
  }),
});

const validationCreateCard = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string()
      .required()
      .pattern(
        /https?:\/\/(w{3}\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,300}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)/,
      ),
  }),
});

const validationCardId = celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex(),
  }),
});

const validationCreateUser = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(
      /https?:\/\/(w{3}\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,300}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)/,
    ),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(2),
  }),
});

const validationLogin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(2),
  }),
});

module.exports = {
  validationLogin,
  validationCreateUser,
  validationUserId,
  validationCardId,
  validationUpdateAvatar,
  validationCreateCard,
  validationUpdateProfile,
};
