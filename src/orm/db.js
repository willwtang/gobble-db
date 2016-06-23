const mysql = require('mysql');

class Connection {
  constructor(details) {
    const connection = mysql.createConnection(details);
    this.getConnection = () => connection;
  }
}

const host = process.env.HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = test;

module.exports = new Connection({ host, user, password, database });
