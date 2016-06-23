// Dependencies
const utility = require('./utility');


class QueryBuilder {
  constructor() {
    this.sequence = [];
  }
  raw(...args) {
    this.sequence.push(args.join(' '));
  }
  select(obj) {
    // obj = {
    //   what: { column: ${ALIAS} }
    //   from: { table: ${ALIAS} }
    // }
    this.sequence.push(`SELECT ${this._parseInput(obj.what, this._parseColumns)} FROM ${this._parseInput(obj.from, this._parseTables)}`);
    return this;
  }
  _parseInput(obj, stringFunc) {
    let columns;
    const type = utility.type(obj);
    if (type === 'string') {
      columns = [obj];
    } else if (type === 'array') {
      columns = obj;
    } else if (type === 'object') {
      columns = [];
      const entries = Object.entries(obj);
      for (let i = 0; i < entries.length; i++) {
        columns.push(stringFunc(entries[i][0], entries[i][1]));
      }
    } else {
      throw new Error('Unexpected input');
    }
    return columns.join(',');
  }

  _parseTables(alias, tableName) {
    return `${tableName} AS ${alias}`;
  }

  _parseColumns(alias, tableName) {
    return `${alias}.${tableName}`;
  }

  _parseEquailty(obj) {
    const type = utility.type(obj);
    const results = [];
    if (type === 'string') {
      results.push(obj);
    } else if (type === 'object') {
      const entries = Object.entries(obj);
      for (let i = 0; i < entries.length; i++) {
        results.push(`${entries[i][0]} = ${entries[i][1]}`);
      }
    }
    return results.join(' AND ');
  }
  where(...args) {
    let target;
    const first = args[0];
    if (typeof first === 'string') {
      target = args.join(' ');
    } else if (typeof first === 'object') {
      target = this._parseEquailty(first);
    }
    this.sequence.push(`WHERE ${target}`);
  }

  andWhere() {

  }

  innerJoin(obj) {
    // obj = {
    //   table: {
    //     tableName: ${ALIAS}
    //   }
    //   on: {
    //     column: column
    //   }
    // }
    const query = `INNER JOIN ${this.parseInput(obj.table)} ON ${this._parseEquailty(obj.on)}`;
    this.sequence.push(query);
  }

  insertOrUpdate(obj) {
    // obj = {
    //   table: tableName,
    //   columns: { columnName: value }
    // }
    const columns = Object.keys(obj.columns);
    const values = columns.map(key => obj.columns[key]);
    const query = `INSERT INTO ${obj.table} (${columns.join(',')}) VALUES (${values.join(',')}) ON DUPLICATE KEY UPDATE ${columns.map(column => `${column} = VALUES(${column})`).join(',')};`;
    this.sequence.push(query);
  }
}

module.exports = QueryBuilder;
