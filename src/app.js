require('babel-polyfill');

// Load environment variables
const dotenv = require('dotenv');
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: './env/development.env' });
} else if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: './env/production.env' });
}

const express = require('express');
const app = express();

const morgan = require('morgan');
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello, World!' });
});

app.listen(process.env.PORT, () => {
  console.log(`${process.env.APP_NAME} is listening on port ${process.env.PORT}.`);
});

module.exports = app;
