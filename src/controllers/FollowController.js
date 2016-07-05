const { Follow } = require('./../models');

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

module.exports = {
  postFollow,
};
