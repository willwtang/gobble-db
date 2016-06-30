const morgan = require('morgan');
const bodyParser = require('body-parser');

const config = (app) => {
  app.use(morgan('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
};

export default config;
