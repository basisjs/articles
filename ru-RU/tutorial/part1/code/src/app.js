require('basis.ui');
new basis.ui.Node({
  container: document.body,
  template: resource('./template/app.tmpl'),
  binding: {
    hello: require('./module/hello/index.js'),
    list: require('./module/list/index.js')
  }
});