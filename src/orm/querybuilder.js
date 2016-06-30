// Dependencies
const utility = require('./utility');
const db = require('./db');

class QueryBuilder {
  constructor() {
    this.sequence = [];
    this.currentSelected = null;
  }
  raw(...args) {
    this.sequence.push(args.join(' '));
  }
  select(obj) {
    // obj = {
    //   what: { column: ${ALIAS} } OR [] OR string
    //   from: { table: ${ALIAS} } or [] OR string
    // }
    this.sequence.push(`SELECT ${this._parseInput(obj.what, this._parseColumns)} FROM ${this._parseInput(obj.from, this._parseTables)}`);
    this.currentSelected = obj;
    return this;
  }

  insertOrUpdate(obj) {
    // obj = {
    //   table: tableName,
    //   columns: { columnName: value }
    // }
    const columns = Object.keys(obj.columns);
    const values = columns.map(key => {
      if (typeof obj.columns[key] === 'string') {
        return `'${obj.columns[key]}'`;
      }
      return obj.columns[key];
    });
    const query = `INSERT INTO ${obj.table} (${columns.join(',')}) VALUES (${values.join(',')}) ON DUPLICATE KEY UPDATE ${columns.map(column => `${column} = VALUES(${column})`).join(',')}`;
    this.sequence.push(query);
    return this;
  }

  _where(conjunction, ...args) {
    let target;
    const first = args[0];
    if (typeof first === 'string') {
      target = args.join(' ');
    } else if (typeof first === 'object') {
      target = this._parseEquailty(first);
    }
    this.sequence.push(`${conjunction} ${target}`);
    return this;
  }

  where(...args) {
    return this._where('WHERE', ...args);
  }

  andWhere(...args) {
    return this._where('AND', ...args);
  }

  orWhere(...args) {
    return this._where('OR', ...args);
  }


  innerJoin(obj) {
    // obj = {
    //   target:
    //   table:
    //   on: {
    //     column: column
    //   }
    // }
    const query = `INNER JOIN ${obj.target} ON ${this._parseEquailty(obj.on, obj.table, obj.target)}`;
    this.sequence.push(query);
    return this;
  }

  // leftJoin(obj) {
  //   const query = `LEFT JOIN ${this._parseInput(obj.table)} ON ${this._parseEquailty(obj.on)}`;
  //   this.sequence.push(query);
  //   return this;
  // }

  destroy(obj) {
    if (utility.type(obj) !== 'object') {
      throw new Error('Wrong type of input in destroy function');
    }

    this.sequence.push(`DELETE FROM ${obj.table}`);
    if (obj.hasOwnProperty('where')) {
      this.where(obj.where);
    }
    return this;
  }

  alterTable(obj) {
    // obj = {
    //   table: tableName,
    //   add:
    //   drop:
    //   alter:
    // }
    let target;
    if (obj.hasOwnProperty('add')) {
      target = `ADD ${obj.add}`;
    } else if (obj.hasOwnProperty('drop')) {
      target = `DROP ${obj.drop}`;
    } else if (obj.hasOwnProperty('alter')) {
      target = `ALTER ${obj.alter}`;
    }
    const query = `ALTER TABLE ${obj.table} ${target}`;
    this.sequence.push(query);
    return this;
  }
// ################################################ EXECUTE QUERIES ###############################################

  fire() {
    const query = this.sequence.join(' ');
    console.log(query);
    return db.getConnection()
      .then(conn => conn.query(query).then(res => {
        db.release(conn);
        return res;
      }))
      .catch(err => {
        const error = `You have a database query error: \n The query was: ${query} \n The error was: ${err}`;
        console.log(error);
      });
  }

  materialize() {
    return `${this.sequence.join(' ')};`;
  }


// ############################################### HELPER FUNCTIONS ###############################################
  _parseInput(obj, stringFunc) {
    let columns;
    const type = utility.type(obj);
    if (type === 'string') {
      columns = [obj];
    } else if (type === 'array') {
      columns = obj;
    } else if (type === 'object') {
      columns = [];
      const entries = Object.keys(obj);
      for (let i = 0; i < entries.length; i++) {
        columns.push(stringFunc(entries[i], obj[entries[i]]));
      }
    } else {
      throw new Error('Unexpected input');
    }
    return columns.join(',');
  }

  _parseTables(alias, tableName) {
    return `${tableName}${alias ? ` AS ${alias}` : ''}`;
  }

  _parseColumns(alias, columnName) {
    return `${alias ? `${alias}.` : ''}${columnName}`;
  }

  _parseEquailty(obj, table1, table2) {
    const type = utility.type(obj);
    const results = [];
    table1 = table1 ? `${table1}.` : '';
    table2 = table2 ? `${table2}.` : '';
    if (type === 'string') {
      results.push(obj);
    } else if (type === 'object') {
      const entries = Object.keys(obj);
      for (let i = 0; i < entries.length; i++) {
        results.push(`${table1}${entries[i]} = ${table2}${(table1 || table2 || utility.type(obj[entries[i]]) === 'number') ? obj[entries[i]] : `'${obj[entries[i]]}'`}`);
      }
    }
    return results.join(' AND ');
  }

  // _columnEquality(obj, table1, table2) {
  //   const type = utility.type(obj);
  //   const results = [];

  //   if (type === 'string') {
  //     results.push(obj);
  //   } else if (type === 'object') {
  //     const entries = Object.keys(obj);
  //     for (let i = 0; i < entries.length; i++) {
  //       results.push(`${table1}${entries[i]} = ${table2}${utility.type(obj[entries[i]]) === 'number' ? obj[entries[i]] : `'${obj[entries[i]]}'`}`);
  //     }
  //   }
  // }
}

a = new QueryBuilder();
module.exports = QueryBuilder;
