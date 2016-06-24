const mysql = require('promise-mysql');

class Pool {
  constructor(details) {
    const connection = mysql.createPool(details);
    this.getConnection = () => connection.getConnection();
    this.release = conn => connection.releaseConnection(conn);
  }
}

const host = process.env.HOST || '127.0.0.1';
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || 'abc';
const database = 'test';

const pool = new Pool({ host, user, password, database });

pool.getConnection().then(conn => conn.query('START TRANSACTION;')).then(res => console.log(res));
module.exports = pool;
