const UserController = require('./../controllers/UserController');

const routes = (app) => {
  app.get('/db/user', UserController.getUser);
};

module.exports = routes;
