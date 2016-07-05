const { User, Follow } = require('./../models');
const { mapSeries } = require('async');

const postFollow = (req, res) => {
  const newFollow = {
    follower: req.body.follower,
    followed: req.body.followed,
  };

  Follow.save(newFollow)
    .then(() => {
      console.log('New follow success.');
      Follow.fetch(newFollow)
        .then(results => results[0])
        .then(fetchedUser => {
          res.status(200).json(fetchedUser);
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        description: 'Gobble DB - Follow.save',
        error: err,
      });
    });
};

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

const getFollowers = (req, res) => {
  Follow.fetch({ followed: req.query.facebook_id })
    .then(follows => follows.map(follow => follow.follower))
    .then(followerIds => {
      mapSeries(followerIds, getUserById, (err, followers) => {
        if (!err) {
          res.status(200).json(followers);
        } else {
          throw Error(err);
        }
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        description: 'Gobble DB - Follow.fetch - getFollowers',
        error: err,
      });
    });
};

const getFollowing = (req, res) => {
  Follow.fetch({ follower: req.query.facebook_id })
    .then(follows => follows.map(follow => follow.followed))
    .then(followingIds => {
      mapSeries(followingIds, getUserById, (err, following) => {
        if (!err) {
          res.status(200).json(following);
        } else {
          throw Error(err);
        }
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        description: 'Gobble DB - Follow.fetch - getFollowing',
        error: err,
      });
    });
};

module.exports = {
  postFollow,
  getFollowers,
  getFollowing,
};
