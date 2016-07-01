const QueryBuilder = require('./querybuilder');

class Model {
  constructor(tableName, schema) {
    this.tableName = tableName;
    this.schema = schema;
  }

  fetch(where, what) {
    const qb = new QueryBuilder();
    what = what || '*';
    return qb
      .select({ what, from: this.tableName })
      .where(where)
      .fire();
  }

  match(where) {
    // where: {
    // columnName: []
    // }
    const qb = new QueryBuilder();
    return qb
      .select({ what: '*', from: this.tableName })
      .whereIn(where)
      .fire();
  }

  save(obj) {
    const qb = new QueryBuilder();
    const wrap = {
      table: this.tableName,
      columns: obj,
    };
    return qb.insertOrUpdate(wrap).fire();
  }

  destroy(obj) {
    const qb = new QueryBuilder();
    obj.table = this.tableName;
    return qb
      .destroy(obj)
      .fire();
  }

  _join(qb, objs) {
    for (let i = 0; i < objs.length; i++) {
      const obj = objs[i];
      const table = obj.table.tableName;
      const on = obj.on;
      qb.innerJoin({ table: this.tableName, target: table, on });
    }
  }

  join(...objs) {
    const qb = new QueryBuilder();
    const what = '*';
    qb.select({ what, from: this.tableName });

    this._join(qb, objs);
    return qb.fire();
  }

  selectJoinChain(what, where, orderBy, limit, ...objs) {
    const qb = new QueryBuilder();
    const qb2 = new QueryBuilder();
    qb2.select({ what: '*', from: this.tableName, orderBy, limit, as: 'T1' });
    qb.select({ what, from: qb2.materialize() });
    this._join(qb, objs);
    if (where) qb.where(where);
    return qb.fire();
  }

  leftJoin(obj) {
    const qb = new QueryBuilder();
    const what = obj.what || '*';
    const table = obj.table.tableName;
    const on = obj.on;

    return (qb
      .select({ what, from: this.tableName })
      .leftJoin({ table: this.tableName, target: table, on })
      .fire());
  }
}

module.exports = Model;
