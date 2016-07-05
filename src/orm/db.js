const mysql = require('promise-mysql');

class Pool {
  constructor(details) {
    const detail = Object.keys(details);
    for (let i = 0; i < detail.length; i++) {
      this[detail[i]] = details[detail[i]];
    }
    const connection = mysql.createPool(details);
    this.getConnection = () => connection.getConnection();
    this.release = conn => connection.releaseConnection(conn);
  }
}

const host = process.env.HOST || '127.0.0.1';
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || 'password';
const database = process.env.APP_NAME || 'gobble_db';

const pool = new Pool({ host, user, password, database });

module.exports = pool;
