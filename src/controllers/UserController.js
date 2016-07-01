const { User } = require('./../models');

const getUser = (req, res) => {
  User.fetch({ facebook_id: req.query.facebook_id })
    .then(results => results[0])
    .then(fetchedUser => {
      if (fetchedUser) {
        res.status(200).json(fetchedUser);
      } else {
        res.sendStatus(404);
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        description: 'Gobble DB - User.fetch',
        error: err,
      });
    });
};

const postUser = (req, res) => {
  const newUser = {
    facebook_id: req.body.facebook_id,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    display_name: req.body.display_name,
    gender: req.body.gender,
    photo_url: req.body.photo_url,
  };

  User.save(newUser)
    .then(() => {
      // Not using mySQL response as of now
      console.log('New user success.');
      User.fetch({ facebook_id: newUser.facebook_id })
        .then(results => results[0])
        .then(fetchedUser => {
          res.status(200).json(fetchedUser);
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        description: 'Gobble DB - User.save',
        error: err,
      });
    });
};

module.exports = {
  getUser,
  postUser,
};
