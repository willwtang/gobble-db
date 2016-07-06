const MediaController = require('../controllers/MediaController');

const routes = app => {
  app.get('/db/media', MediaController.sendMediaByPostId);
};

module.exports = routes;
