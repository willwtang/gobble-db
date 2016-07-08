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

  updateSet(obj) {
    const table = obj.table;
    const set = this._parseColumnEquality(obj.set);

    this.sequence.push(`UPDATE ${table} SET ${set}`);
    return this;
  }
  select(obj) {
    // obj = {
    //   what: { column: ${ALIAS} } OR [] OR string
    //   from: { table: ${ALIAS} } or [] OR string
    //   orderBy: column
    //   limit:
    // }
    const sequence = [];
    const what = this._parseInput(obj.what, this._parseColumns);
    const fromStr = this._parseInput(obj.from, this._parseTables);
    const orderBy = obj.orderBy || '';
    const asObj = obj.as || '';
    const where = obj.where || '';
    const whereIn = obj.whereIn || '';

    let limit = '';
    if (obj.hasOwnProperty('limit')) limit = (utility.type(obj.limit) === 'array' ? obj.limit.join(',') : obj.limit);

    sequence.push(`SELECT ${what} FROM ${fromStr}`);

    if (where) {
      this.where(where);
      sequence.push(this.sequence.pop());
    }
    if (whereIn) {
      this.whereIn(whereIn);
      sequence.push(this.sequence.pop());
    }
    if (orderBy) sequence.push(`ORDER BY ${orderBy}`);
    if (limit) sequence.push(`LIMIT ${limit}`);
    if (asObj) {
      this.sequence.push(`((${sequence.join(' ')}) AS ${asObj})`);
      return this;
    }
    this.sequence.push(sequence.join(' '));
    this.currentSelected = obj;
    return this;
  }

  insertOrUpdate(obj) {
    // obj = {
    //   table: tableName,
    //   columns: { columnName: value }
    // }
    const columns = Object.keys(obj.columns);
    const values = columns.map(key => utility.stringify(obj.columns[key]));
    const query = `INSERT INTO ${obj.table} (${columns.join(',')}) VALUES (${values.join(',')}) ON DUPLICATE KEY UPDATE ${columns.map(column => `${column} = VALUES(${column})`).join(',')}`;
    this.sequence.push(query);
    return this;
  }

  _where(conjunction, ...args) {
    let target;
    const first = args[0];
    const type = utility.type(first);
    let conjunction2 = conjunction;
    if (type === 'string') {
      target = args.join(' ');
    } else if (type === 'object') {
      let flag = false;
      const whereIn = {};
      const keys = Object.keys(first);
      keys.forEach(key => {
        if (Array.isArray(first[key])) {
          whereIn[key] = first[key];
          delete first[key];
          flag = true;
        }
      });
      if (flag) {
        this._whereIn(conjunction, whereIn);
        conjunction2 = 'AND';
      }
      target = this._parseEquailty(first);
    }
    if (target) this.sequence.push(`${conjunction2} ${target}`);
    return this;
  }

  where(...args) {
    if (!args.length) return this;
    return this._where('WHERE', ...args);
  }

  andWhere(...args) {
    return this._where('AND', ...args);
  }

  orWhere(...args) {
    return this._where('OR', ...args);
  }

  _whereIn(conjunction, obj) {
    // {
    //   columnName: in???
    // }
    const columns = Object.keys(obj);
    const results = [];
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const values = obj[column].map(value => utility.stringify(value));
      const query = `${column} IN (${values})`;
      results.push(query);
    }
    if (results.length) this.sequence.push(`${conjunction} ${results.join(' AND ')}`);
    return this;
  }

  whereIn(obj) {
    return this._whereIn('WHERE', obj);
  }

  orWhereIn(obj) {
    return this._whereIn('OR', obj);
  }


  innerJoin(obj) {
    // obj = {
    //   target:
    //   table:
    //   on: {
    //     column: column
    //   }
    // }
    const query = `INNER JOIN ${obj.target} ON ${this._parseColumnEquality(obj.on)}`;
    this.sequence.push(query);
    return this;
  }

  leftJoin(obj) {
    const query = `LEFT JOIN ${obj.target} ON ${this._parseColumnEquality(obj.on)}`;
    this.sequence.push(query);
    return this;
  }

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

  groupBy(obj) {
    this.sequence.push(`GROUP BY ${obj}`);
    return this;
  }

  orderBy(obj) {
    this.sequence.push(`ORDER BY ${obj}`);
    return this;
  }
// ################################################ EXECUTE QUERIES ###############################################

  fire() {
    const query = this.sequence.join(' ');
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
    return this.sequence.join(' ');
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

  _parseEquailty(obj) {
    const type = utility.type(obj);
    const results = [];

    if (type === 'string') {
      results.push(obj);
    } else if (type === 'object') {
      const entries = Object.keys(obj);
      for (let i = 0; i < entries.length; i++) {
        results.push(`${entries[i]} = ${utility.stringify(obj[entries[i]])}`);
      }
    }
    return results.join(' AND ');
  }

  _parseColumnEquality(obj, table1, table2) {
    table1 = table1 ? `${table1}.` : '';
    table2 = table2 ? `${table2}.` : '';

    const type = utility.type(obj);
    const results = [];

    if (type === 'string') {
      results.push(obj);
    } else if (type === 'object') {
      const entries = Object.keys(obj);
      for (let i = 0; i < entries.length; i++) {
        results.push(`${table1}${entries[i]} = ${table2}${obj[entries[i]]}`);
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

// a = new QueryBuilder();
module.exports = QueryBuilder;
