const UserController = require('./../controllers/UserController');

const routes = (app) => {
  app.get('/db/user', UserController.getUser);
  app.post('/db/user', UserController.postUser);
};

module.exports = routes;
