const RecUserController = require('../controllers/RecUserController');

const routes = app => {
  app.get('/db/recuser', RecUserController.sendAllUserRatings);
  app.get('/db/recuser/product', RecUserController.sendProductsByIds);
};

module.exports = routes;
