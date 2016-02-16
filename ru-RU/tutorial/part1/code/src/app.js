var Node = require('basis.ui').Node;

new Node({
  container: document.body,
  template: resource('./template/app.tmpl'),
  binding: {
    hello: require('./module/hello/index.js'),
    list: require('./module/list/index.js')
  }
});
