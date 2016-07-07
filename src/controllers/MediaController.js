const { Media } = require('../models/');

const getMediaByPostId = function(postId) {
  return Media.fetch({ Post_id: postId });
};

const sendMediaByPostId = function(req, res) {
  const postId = req.query.post_id;
  return getMediaByPostId(postId)
    .then(results => res.send(results))
    .catch(err => console.log(`Error in sendMediaByPostId ${err}`));
};

module.exports = { sendMediaByPostId };
