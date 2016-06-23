// var { Schema } = require('../orm.js');

// Schema.createTable('User', function(user) {
//   user.bigInt('facebookId', 64, 'UNSIGNED');
//   user.varChar('email', 255);
//   user.varChar('firstName', 255);
//   user.varChar('lastName', 255);
//   user.primaryKey('user_pk', 'facebookId');
// });

// Schema.createTable('Product', function(product) {
//   product.bigInt('upc', 64, 'UNSIGNED');
//   product.primaryKey('Product_pk', 'upc');
//   product.varChar('name', 255);
// });

class test {
  constructor(a, b) {
    this.a = a;
    this.b = b;
    // console.log(this.a, this.b);
  }

  test2() {
    console.log('test');
  }
}

class test2 extends test {
  constructor(a, b) {
    this.a = a;
    this.b = b;
    // console.log(this.a, this.b);
  }

  test3() {
    console.log('test');
  }
}
test = test.bind(null, 'a', 'b');
a = new test();

console.log(test2.prototype);