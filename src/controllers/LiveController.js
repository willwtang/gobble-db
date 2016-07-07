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

const incrementLiveView = (req, res) => {
  const postedLive = {
    User_facebook_id: req.body.facebook_id,
    peer_id: req.body.peer_id,
  };

  Live.fetch(postedLive)
    .then(results => results[0])
    .then(fetchedLive => {
      const updatedLive = {
        User_facebook_id: fetchedLive.User_facebook_id,
        active: Number(fetchedLive.active),
        peer_id: fetchedLive.peer_id,
        views: fetchedLive.views + 1,
      };
      return Live.save(updatedLive);
    })
    .then(() => {
      res.sendStatus(200);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        description: 'Gobble DB - Live, increment view',
        error: err,
      });
    });
};

const endLive = (req, res) => {
  const postedLive = {
    User_facebook_id: req.body.facebook_id,
    peer_id: req.body.peer_id,
  };

  Live.fetch(postedLive)
    .then(results => results[0])
    .then(fetchedLive => {
      const updatedLive = {
        User_facebook_id: fetchedLive.User_facebook_id,
        active: 0,
        peer_id: fetchedLive.peer_id,
        views: fetchedLive.views,
      };
      return Live.save(updatedLive);
    })
    .then(() => {
      res.sendStatus(200);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        description: 'Gobble DB - Live, end live',
        error: err,
      });
    });
};

module.exports = {
  postLive,
  incrementLiveView,
  endLive,
};
