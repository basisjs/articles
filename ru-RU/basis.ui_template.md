# basis.ui и шаблоны

Шаблон назначается свойством `template`. При создании класса, производного от `basis.ui.Node` или его экземпляров, этому свойству задается экземпляр `basis.template.html.Template`. Используя его, объект создаст экземпляр шаблона (DOM фрагмент + интерфейс) и будет заниматься его обслуживанием.

```js
var Node = basis.require('basis.ui').Node;
var Template = basis.require('basis.template.html').Template;

var Foo = Node.subclass({
  template: new Template('<h1>hello world</h1>')
});

var node = new Node({
  template: new Template(basis.resource('./path/to/template.tmpl'))
});
```

Текущий экземпляр шаблона хранится в свойстве `tmpl`. При назначении шаблона также разрешаются и сохраняются ссылки на ключевые узлы DOM фрагмента `element` и `childNodesElement`. В дальнейшем эти ссылки используются для организации браузерных DOM узлов, без обращения к `tmpl`.

Для передачи значений, доступных шаблону, используется свойство [bindings](basis.ui_bindings.md), а для обратной связи – метод `templateAction` и свойство [action](basis.ui_actions.md).

В течение жизни экземпляра, шаблон можно изменить методом `setTemplate`, которому передается другой экземпляр `basis.template.html.Template`. Метод обеспечивает привязку к шаблону.

При смене шаблона или изменении самого шаблона (его описания) вызывается метод `templateSync`. Этот метод производит создание экземпляра шаблона и осуществляет синхронизацию с ним, при этом выбрасывается событие `templateChanged` без параметров. Если требуется изменять что-то в DOM фрагменте, создаваемом шаблоном, стоит это делать только в этом методе, переопределяя его.

По умолчанию для `basis.ui.Node` и `basis.ui.PartitionNode` задан шаблон с пустым `<div>` элементом. Так как экземпляры `basis.template.html.Template` поддерживают [авторасширение](basis.Class.md#Авторасширение), то необязательно создавать экземпляр `basis.template.html.Template`, достаточно передать значение, которое будет являться источником для нового шаблона.

```js
var Node = basis.require('basis.ui').Node;

var Foo = Node.subclass({
  template: '<h1>hello world</h1>'  // это эквивалентно new basis.template.html.Template('<h1>hello world</h1>')
});

var node = new Node({
  template: basis.resource('./path/to/template.tmpl')
});
```

## Инициализация

Шаблон создается в методе `postInit`, так как при создании шаблона могут вычисляться биндинги, использующие еще не определенные свойства. Таким образом, в методе `init` недоступно свойство `tmpl` (оно равно `null`), а `element` и `childNodesElement` ссылаются на временный пустой `DocumentFragment`. Если требуется обращаться к `DOM` фрагменту, который создает шаблон, или изменять его при создании экземпляра `basis.ui.Node`, то это нужно описывать в переопределеном методе `templateSync`.

```js
var Node = basis.require('basis.ui').Node;

var node = new Node({
  template: '<div class="foo">{example}</div>',
  binding: {
    example: function(){
      return 'hello world';
    }
  },
  init: function(){
    Node.prototype.init.call(this);

    console.log(this.tmpl);
    // console> null

    console.log(this.element === this.childNodesElement);
    // console> true

    console.log(this.element);
    // console> #document-fragment
  },
  templateSync: function(){
    Node.prototype.templateSync.call(this);

    console.log(this.tmpl);
    // console> { element: div.foo, example: #text, templateId_: 0, set: function(name, value){ .. } }

    console.log(this.element);
    // console> <div class="foo">hello world</div>
  }
});
```
