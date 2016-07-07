const { Live, User } = require('./../models');

const postLive = (req, res) => {
  const postedLive = {
    User_facebook_id: req.body.facebook_id,
    active: Number(req.body.active),
    peer_id: req.body.peer_id,
    views: req.body.views,
  };
  let responseJSON = {};

  Live.save(postedLive)
    .then(() => {
      console.log('New live success.');
      return Live.fetch({
        peer_id: postedLive.peer_id,
        User_facebook_id: postedLive.User_facebook_id,
      });
    })
    .then(liveResults => liveResults[0])
    .then(fetchedLive => {
      responseJSON = Object.assign({}, fetchedLive);
      return User.fetch({ facebook_id: fetchedLive.User_facebook_id });
    })
    .then(userResults => userResults[0])
    .then(fetchedUser => {
      responseJSON = Object.assign({}, responseJSON, {
        user: fetchedUser,
      });
      res.status(200).json(responseJSON);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        description: 'Gobble DB - Live.save',
        error: err,
      });
    });
};

module.exports = {
  postLive,
};
