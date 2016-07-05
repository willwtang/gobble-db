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

const getIsFollowing = (req, res) => {
  const followerId = req.query.follower_id;
  const followedId = req.query.followed_id;
  Follow.fetch({ follower: followerId, followed: followedId })
    .then(results => results[0])
    .then(follow => {
      if (follow) {
        res.status(200).json(true);
      } else {
        res.status(200).json(false);
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        description: 'Gobble DB - Follow.isFollowing',
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
  getIsFollowing,
  getFollowers,
  getFollowing,
};
