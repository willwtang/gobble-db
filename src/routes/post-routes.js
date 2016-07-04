const PostController = require('../controllers/PostController');

const routes = app => {
  app.get('/db/post/date', PostController.sendPostsByDate);
  app.get('/db/post/friends', PostController.sendPostsByFriends);
  app.get('/db/post/parent', PostController.sendCommentsByParentId);
};

module.exports = routes;
