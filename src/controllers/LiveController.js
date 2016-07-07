const { Follow, Live, User } = require('./../models');
const { mapSeries, map } = require('async');

const getUserById = (facebookId, callback) => {
  User.fetch({ facebook_id: facebookId })
    .then(results => results[0])
    .then(fetchedUser => {
      callback(null, fetchedUser);
    })
    .catch(err => {
      callback(err, null);
    });
};

const mergeUsersAndLives = (users, lives) => {
  const merged = [];
  lives.forEach((live, i) => {
    merged.push(Object.assign({}, live, {
      user: users[i],
    }));
  });
  return merged;
};

const getAllActive = (req, res) => {
  let activeLives;
  let activeUsers;

  Live.fetch({ active: 1 })
    .then(activeLivesResults => {
      activeLives = activeLivesResults;
      return activeLives.map(activeLive => activeLive.User_facebook_id);
    })
    .then(activeUserIds => {
      mapSeries(activeUserIds, getUserById, (err, activeUserResults) => {
        if (!err) {
          activeUsers = activeUserResults;
          const responseJSON = mergeUsersAndLives(activeUsers, activeLives);
          res.status(200).json(responseJSON);
        } else {
          throw Error(err);
        }
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        description: 'Gobble DB - Live, get all active',
        error: err.message,
      });
    });
};

const getLivesById = (facebookId, callback) => {
  let lives;
  let users;

  Live.fetch({ User_facebook_id: facebookId })
    .then(livesResults => {
      lives = livesResults;
      return lives.map(live => live.User_facebook_id);
    })
    .then(userIds => {
      mapSeries(userIds, getUserById, (err, userResults) => {
        if (!err) {
          users = userResults;
          const liveRows = mergeUsersAndLives(users, lives);
          callback(null, liveRows);
        } else {
          callback(err, null);
        }
      });
    });
};

const flattenAndSort = arr => arr.reduce((a, b) => a.concat(b), []).sort((a, b) => a.Live_created_at > b.Live_created_at);

const getLiveList = (req, res) => {
  const facebookId = req.query.facebook_id;

  Follow.fetch({ follower: facebookId })
    .then(follows => follows.map(follow => follow.followed))
    .then(followingIds => {
      map(followingIds, getLivesById, (err, liveListArrays) => {
        if (!err) {
          const liveList = flattenAndSort(liveListArrays);
          res.status(200).json(liveList);
        } else {
          throw Error(err);
        }
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        description: 'Gobble DB - Live, get live list',
        error: err.message,
      });
    });
};

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
  getAllActive,
  getLiveList,
  postLive,
  incrementLiveView,
  endLive,
};
