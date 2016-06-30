const { User } = require('./../models');

const getUser = (req, res) => {
  const facebookId = req.query.facebookId;
};

module.exports = { getUser };
