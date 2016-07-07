var Node = require('basis.ui').Node;

module.exports = new Node({
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
