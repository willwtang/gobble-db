const RecUserController = require('../controllers/RecUserController');

const routes = app => {
  app.get('/db/recuser', RecUserController.sendAllUserRatings);
};

module.exports = routes;
