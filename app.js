const express = require('express');
const mongoose = require('mongoose');
const usersRoute = require('./routes/users');
const cardsRoute = require('./routes/cards');

const PORT = 3000;
const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use((req, res, next) => {
  req.user = {
    _id: '61e6dbf37d24afbb7c018bca',
  };

  next();
});

app.use(express.json());
app.use('/users', usersRoute);
app.use('/cards', cardsRoute);
app.use((req, res) => {
  res.status(404).send({ message: 'Несуществующий роут' });
});

app.listen(PORT, () => {
  console.log(PORT);
});
