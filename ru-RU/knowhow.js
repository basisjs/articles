//А знаете ли вы что...

//А знаете ли вы, что для Entity можно определять поля, которые являются индексом на вложеный набор https://gist.github.com/lahmatiy/5932422

basis.require('basis.entity');
basis.require('basis.data.index');

var Item = basis.entity.createType('SomeType', {
  value: Number
});

var DemoType = basis.entity.createType('DemoType', {
  items: basis.entity.createSetType(Item),
  sum: basis.entity.calc('items', function(items){  // ключевой момент, со
    if (items)
      return basis.data.index.sum(items, 'data.value');
  })
});

var dataObject = DemoType({
  items: [
    { value: 1 },
    { value: 2 },
    { value: 3 }
  ]
});

// dataObject.data.sum -> instance of basis.data.index.Sum
// dataObject.data.sum.value === 6

var view = new basis.ui.Node({
  container: document.body,
  delegate: dataObject,

  template: '<span>Items sum is {sum}</span>',
  binding: {
    sum: 'data:'
  }
});

//А знаете ли вы, что basis.ui.Node в простых случаях может сам загружать данные без delegate/dataSource/etc

basis.require('basis.data');
basis.require('basis.ui');
basis.require('basis.net.action');

var simpleList = new basis.ui.Node({
  syncAction: basis.net.action.create({
    url: 'some/url/to.json',
    success: function(data){
      // data = [ { title: 'title', ... }, ... ]
      this.setChildNodes(basis.data.wrap(data));
    }
  }),

  template: '<ul/>',

  childClass: {
    template: '<li>{title}</li>',
    binding: {
      title: 'data:'
    }
  }
});

// идеи
строка в entity.createType вместо типа -> ссылка на тип, когда он объявится, то заменится на функцию

