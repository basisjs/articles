require('basis.ui');

module.exports = new basis.ui.Node({
  template: resource('./template/hello.tmpl'),
  data: {
    name: 'world'
  },
  binding: {
    name: 'data:name'
  },
  action: {
    setName: function(event){
      this.update({
        name: event.sender.value
      });
    }
  }
});