var Node = require('basis.ui').Node;

module.exports = new Node({
  template: resource('./template/list.tmpl'),
  childClass: {
    template: resource('./template/item.tmpl'),
    binding: {
      name: function(node){
        return node.name;
      }
    },
    action: {
      say: function(){
        alert(this.name);
      }
    }
  },
  childNodes: [
    { name: 'foo' },
    { name: 'bar' },
    { name: 'baz' }
  ]
});
