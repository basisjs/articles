# Выделение (selection)

Механизм "выделения" предназначен для универсального обозначения "выбранных" элементов, часто используется в интерфейсах.

Определение "выбранный" стоит воспринимать более широко. Такие состояния как активный (active), текущий (current) и другие, так же могут быть выражены через этот паттерн.

## Принцип работы

Узел считается выбранным, если его свойство `selected` имеет значение `true`. Это значение можно изменить методами:

- `select(multiple)` – устанавливает значение `true`;
- `unselect()` – устанавливает значение `false`;
- `setSelected(selected, multiple)` - устанавливает значение в зависимости от переданного параметра `selected`.

```js
var Node = require('basis.ui').Node;
var view = new Node();

console.log(view.selected);
// > false

view.select();
console.log(view.selected);
// > true

view.unselect();
console.log(view.selected);
// > false
```

> Стоит помнить, что значение `selected` должно меняться исключительно указанными выше методами. Для чего используется параметр `multiple` будет описано в разделе [Единичный и множественный выбор](#%D0%95%D0%B4%D0%B8%D0%BD%D0%B8%D1%87%D0%BD%D1%8B%D0%B9-%D0%B8-%D0%BC%D0%BD%D0%BE%D0%B6%D0%B5%D1%81%D1%82%D0%B2%D0%B5%D0%BD%D0%BD%D1%8B%D0%B9-%D0%B2%D1%8B%D0%B1%D0%BE%D1%80).

Когда свойство `selected` становится равно `true`, выбрасывается событие `select`, при установке в `false` – `unselect`. Начальное значение можно задать при создании узла, но событие `select` при этом выбрасываться не будет.

```js
var Node = require('basis.ui').Node;
var view = new Node({
  selected: true,
  handler: {
    select: function(){
      console.log('node selected');
    },
    unselect: function(){
      console.log('node unselected');
    }
  }
});

// событие select выброшено не будет
console.log(view.selected);
// > true

view.select();
// событие select выброшено не будет, так как 
// значение selected не было изменено

view.unselect();
// > node unselected

view.select();
// > node selected
```

## Контекст выделения (Selection)

Изменение значения `selected` без дополнительных настроек не влияет на состояние других узлов. Но нередко необходимо чтобы значение `selected` учитывалось в рамках нескольких узлов. Например, в списках нужно учитывать все элементы списка. Для этой цели узлам назначается контекст выделения.

Контекст выделения задается через свойство `contextSelection`. По умолчанию оно не задано (равно `null`) и узел ведет себя независимо (поведение похоже на `checkbox`).

Сам контекст выделения представляет собой набор, экземпляр специального класса `basis.dom.wrapper.Selection`. Этот класс унаследован от `basis.data.Dataset` и имеет тот же интерфейс. Его главной особенностью является синхронизация своего состава со значением свойства `selected` его членов. Так, если добавить в такой набор узел, то свойство `selected` узла будет выставлено в `true`, а если удалить из набора, то у удаленного узла `selected` станет равно `false`. Справедливо и обратное, если узлу выставить значение `selected` в `true`, то он будет автоматически добавлен в набор, указанный в `contextSelection`, а если в `false`, то удален из него.

```js
var Node = require('basis.ui').Node;
var Selection = require('basis.dom.wrapper').Selection;

var selection = new Selection();
var view = new Node({
  contextSelection: selection
});

console.log(view.selected, selection.itemCount);
// > false 0

view.select();
console.log(view.selected, selection.itemCount);
// > true 1

selection.remove(view);
console.log(view.selected, selection.itemCount);
// > false 0
```

Во избежание конфликтов узлы нельзя добавлять в произвольный экземпляр `Selection`. В экземпляр `Selection` можно добавлять только те узлы, у которых свойство `contextSelection` ссылается на этот набор. Так же узел должен быть экземпляром `basis.dom.wrapper.Node` и его свойство `selected` не должно быть [реактивным](#%D0%A0%D0%B5%D0%B0%D0%BA%D1%82%D0%B8%D0%B2%D0%BD%D1%8B%D0%B5-%D0%B7%D0%BD%D0%B0%D1%87%D0%B5%D0%BD%D0%B8%D1%8F).

Не смотря на то, что `contextSelection` можно выставить при создании узла, его не предполагается задавать явно. Обычно контекст выделения узлы заимствуют у родителя, при его назначении.

Если у узла не задано значение `contextSelection` (по умолчанию не задано) и ему назначается новый родитель, то в качестве значения `contextSelection` выставляется значение свойства `selection` родителя, а если оно не задано (равно `null`), то значение `contextSelection` родителя.

```js
var Node = require('basis.ui').Node;
var Selection = require('basis.dom.wrapper').Selection;

var nodeWithSelection = new Node({
  selection: new Selection()
});
var foo = new Node();
var bar = new Node();

nodeWithSelection.appendChild(foo);
console.log(foo.contextSelection === nodeWithSelection.selection);
// > true

foo.appendChild(bar);
console.log(bar.contextSelection === foo.contextSelection);
// > true
console.log(bar.selection);
// > null
```

Когда узел отвязывается от своего родителя, то значение `contextSelection` выставляется в `null`, при условии, что `contextSelection` равен `selection` родителя или, если значение `selection` не задано (равно `null`), совпадает с `contextSelection` родителя. То есть ситуация обратная привязыванию родителю.

```js
console.log(bar.contextSelection === foo.contextSelection);
// > true

foo.removeChild(bar);
console.log(bar.contextSelection);
// > null

console.log(foo.contextSelection === nodeWithSelection.selection);
// > true

nodeWithSelection.removeChild(foo);
console.log(foo.contextSelection);
// > null
```

Когда у узла (инициатор) меняется значение `contextSelection`, то это же значение выставляется и всем узлам его поддерева, при условии что их значения совпадают. Если у узла в поддереве значение `contextSelection` отличается от значения инициатора до изменения, то его значение не меняется и его поддерево игнорируется. Таким образом контекст выделения работает для деревьев "из коробки".

```js
var Node = require('basis.ui').Node;
var Selection = require('basis.dom.wrapper').Selection;

var node = new Node({
  selection: new Selection()
});
var foo = new Node();
var bar = new Node();

foo.appendChild(bar);

console.log(foo.contextSelection);
// > null
console.log(bar.contextSelection);
// > null

node.appendChild(foo);
console.log(foo.contextSelection === node.selection);
// > true
console.log(bar.contextSelection === node.selection);
// > true

node.removeChild(foo)
console.log(foo.contextSelection);
// > null
console.log(bar.contextSelection);
// > null
```

> Не смотря на сложность описания функционирования `contextSelection`, обычно это не приводит к сложностям использования. Более того, в основном работа осуществляется только с `selection`, а `contextSelection` остается "за кадром". Главное уяснить, что выставление контекста выделения для узла влияет не только на его детей, но и на все его поддерево.

## Работа с Selection

Как было показано в предыдущих примерах, `selection` можно задать при создании узла. Это значение в дальнейшем можно изменить используя метод `setSelection(selection)`. При изменении `selection` срабатывает событие `selectionChanged`, а так же обновляется контекст выделения поддерева узла.

```js
var Node = require('basis.ui').Node;
var Selection = require('basis.dom.wrapper').Selection;

var node = new Node({
  selection: new Selection(),
  handler: {
    selectionChanged: function(sender, oldSelection){
      console.log('selection changed:', oldSelection, '->', this.selection);
    }
  },
  childNodes: [
    new Node()
  ]
});

console.log(node.firstChild.contextSelection === node.selection);
// > true
console.log(node.firstChild.contextSelection)
// > basis.dom.wrapper.Selection { .. }

node.setSelection();
// > selection changed: basis.dom.wrapper.Selection { .. } -> null
console.log(node.selection);
// > null
console.log(node.firstChild.contextSelection);
// > null
```

В качестве `selection` можно задать только экземпляр `basis.dom.wrapper.Selection`. Если задается иное значение, которое приводится к `true`, то это значение считается конфигом и экземпляр `Selection` создается неявно. По этой причине отпадает необходимость импортировать класс `Selection` из модуля `basis.dom.wrapper`.

```js
var Node = require('basis.ui').Node;

var node = new Node({
  selection: { /* настройки */ } // неявное создание new Selection({ .. })
});

// если настроек нет, можно просто передать true
var node = new Node({
  selection: true
});
```

Для `selection` так же поддерживается `listen`.

```js
var node = new Node({
  selection: true,
  listen: {
    selection: {
      itemsChanged: function(selection, delta){
        // this ссылается на node
        console.log('selected node count:', selection.itemCount);
      }
    }
  },
  childNodes: [
    new Node()
  ]
});

node.firstChild.select();
// > selected node count: 1

node.selection.clear();
// > selected node count: 0
```

## Единичный и множественный выбор

Экземпляры `Selection` могут работать в двух режимах:

- единичный выбор - в один момент времени может быть выбран максимум один узел, поведение по умолчанию;
- множественный выбор – может быть выбрано произвольное количество узлов.

При единичном выборе, выбранным всегда становится последний "выбранный" узел, при этом предыдущий удаляется из набора, а его свойство `selected` выставляется в `false`. Если добавляется несколько узлов одновременно (например, используя метод `add()` или `set()`), то выделение сначала очищается, а в качестве единственного члена используется первый элемент переданного массива.

```js
var Node = require('basis.ui').Node;

var list = new Node({
  selection: true,
  childNodes: [
    { name: 'foo', selected: true },
    { name: 'bar' },
    { name: 'baz' }
  ]
});

console.log(list.firstChild.selected);
// > true
console.log(list.selection.pick() === list.firstChild);
// > true

list.lastChild.select();
console.log(list.selection.itemCount);
// > 1
console.log(list.selection.pick() === list.lastChild);
// > true
console.log(list.firstChild.selected);
// > false

list.selection.set(list.childNodes);
console.log(list.selection.itemCount);
// > 1
console.log(list.selection.pick() === list.firstChild);
// > true
```

В случае множественного выбора, количество выбранных узлов не лимитируется. Чтобы включить множественный выбор нужно задать свойство `multiple` равным `true` при создании `Selection`.

```js
var Node = require('basis.ui').Node;

var list = new Node({
  selection: { multiple: true }, // то же что new Selection({ multiple: true })
  childNodes: [
    { name: 'foo' },
    { name: 'bar' },
    { name: 'baz', selected: true }
  ]
});

console.log(list.selection.itemCount);
// > 2

console.log(list.selection.getValues('name'));
// > ['baz']

list.selection.set(list.childNodes);
console.log(list.selection.getValues('name'));
// > ['foo', 'bar', 'baz']
```

Как видно из примера, выделить несколько узлов не сложно, имея доступ к узлу (в данном случае `list`) и его `selection`. Но обычно удобнее управлять выделенностью узла в рамках логики самого узла, то есть пользоваться его методами `select()` и `setSelected()`. Однако, если вызывать эти методы последовательно для нескольких узлов, выбранным окажется только последний. Это происходит по причине того, что эти методы по умолчанию используют режим одиночного выделения.

```js
var Node = require('basis.ui').Node;

var list = new Node({
  selection: { multiple: true },
  childNodes: [
    { name: 'foo' },
    { name: 'bar' },
    { name: 'baz' }
  ]
});

console.log(list.selection.getValues('name'));
// > []

list.childNodes.forEach(function(child){
  // такой вызов метода select использует режим одиночного выбора
  // внутри используется child.contextSelection.set(child)
  child.select();
});

console.log(list.selection.getValues('name'));
// > ['baz']
```

Чтобы использовать режим множественного выбора для методов `select` и `setSelected`, необходимо передавать дополнительный параметр `multiple` равный `true`. Однако такой режим не подразумевает, что узел будет только добавляться к выбранным. В этом режиме значение `selected` меняется как переключатель (`toggle`): если узел еще не выбран, то он становится выбранным, иначе выделение снимается. При этом значение `selected` других узлов в контексте остается неизменным. Поэтому без дополнительных проверок получается инверсия выделения.

```js
var Node = require('basis.ui').Node;

var list = new Node({
  selection: { multiple: true },
  childNodes: [
    { name: 'foo' },
    { name: 'bar', selected: true },
    { name: 'baz' }
  ]
});

console.log(list.selection.getValues('name'));
// > ['bar']

list.childNodes.forEach(function(child){
  // если методу select передается true, то используется режим
  // множественного выбора
  child.select(true);
});

console.log(list.selection.getValues('name'));
// > ['foo', 'baz']
```

Чтобы гарантированно выделить все необходимые узлы, нужно использовать дополнительную проверку.

```js
list.childNodes.forEach(function(child){
  // вызываем метод select только если узел еще не выбран
  if (!child.selected)
    child.select(true);
});
```

Конечно, в простых случаях, если есть доступ к `selection`, то проще использовать `selection.add([node, node, ..])`.

Может показаться странной логика режима множественного выделения. Но все встает на свои места, если учесть, что механизм ориентирован на взаимодействие с пользователем. Режим множественного выделения используется если зажата клавиша `ctrl` (Windows) или `meta` (Mac). В результате получается простое и элегантное решение:

```js
var Node = require('basis.ui').Node;

var list = new Node({
  selection: { multiple: true },
  childNodes: [
    { name: 'foo' },
    { name: 'bar' },
    { name: 'baz' }
  ],
  childClass: {
    template: '<li event-click="select">item</li>',
    action: {
      // данная функция будет вызываться при клике по элементу
      select: function(event){
        // используем режим выбора, в зависимости от зажатых клавиш
        this.select(event.ctrlKey || event.metaKey);
      }
    }
  }
});
```

## Реактивные значения

Начиная с версии `1.4` в качестве значения `selected` можно задать объект с интерфейсом [`binding bridge`](bindingbridge.md) (`bb-value`). В этом случае `selected` будет автоматически синхрозироваться с таким объектом (его значение приводится к `boolean`). При этом `selected` по прежнему хранит `true` или `false`, а при изменениях срабатывают события `select` и `unselect`. Связь с `bb-value` "прячется" в приватном свойстве `selectedRA_`, в котором хранится специальный адаптер-наблюдатель.

```js
var Node = require('basis.ui').Node;

var someValue = new basis.Token(false);
var view = new Node({
  selected: someValue
});

console.log(view.selected);
// > false

someValue.set(true);
console.log(view.selected);
// > true
```

Можно использовать эту возможность для более сложных сценариев. Например, меню, выбранный элемент которого зависит от внешнего значения.

```js
var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;

var currentName = new Value();
var menu = new Node({
  childClass: {
    selected: currentName.compute(function(child, name){
      return child.name == name;
    })
  },
  childNodes: [
    { name: 'foo' },
    { name: 'bar' }
  ]
});

console.log(menu.childNodes.map(function(child){
  return child.selected;
}));
// > [false, false]

currentName.set('foo');
console.log(menu.childNodes.map(function(child){
  return child.selected;
}));
// > [true, false]

currentName.set('bar');
console.log(menu.childNodes.map(function(child){
  return child.selected;
}));
// > [false, true]
```

Стоит принимать во внимание следующие особенности использования `bb-value` в качестве значения `selected`:

- узлы с привязанным `bb-value` не учавствуют в контексте выделения и из нельзя добавить в экземпляр `Selection`;
- вызов методов `select()` и `unselect()` не меняет состояние `selected` (в режиме разработки выводится предупреждение), когда для него установлено `bb-value`;
- для привязки и сбрасывания `bb-value` необходимо использовать метод `setSelected(newValue)`.

## Примеры использования

Несколько примеров использования можно найти в [демонстрациях](http://basisjs.com/basisjs/demo/):

- [одно и то же "выделение" для нескольких компонент](http://basisjs.com/basisjs/demo/common/selection_share.html);
- [несколько контекстов выделения в рамках одного дерева](http://basisjs.com/basisjs/demo/common/selection_multiple.html);
- [использование набора выбранных узлов как источник данных](http://basisjs.com/basisjs/demo/common/selection_datasource.html) для других компонент.

### Подсчет числа выбранных узлов

```js
var Node = require('basis.ui').Node;

var list = new Node({
  selection: { multiple: true }
});

list.selection.itemCount;  // текущее кол-во выбранных узлов
list.selection.addHandler({
  // случаем изменения
  itemsChanged: function(selection){
    selection.itemCount;   // новое кол-во выбранных узлов
  }
});

// используем Value.from
var Value = require('basis.data').Value;
var selectedCount = Value.from(list.selection, 'itemsChanged', 'itemCount');

// используем basis.data.index
var selectedCount = require('basis.data.index').count(list.selection);
```

### Поддержание наличия выбранного элемента в списке

```js
var Node = require('basis.ui').Node;

var list = new Node({
  selection: true,
  listen: {
    selection: {
      // слушаем когда меняется состав выделения
      itemsChanged: function(selection){
        // this -> list
        // если выделение не содержит узлов, делаем выбранным
        // первого ребенка
        if (!selection.itemCount && this.firstChild)
          this.firstChild.select();
      }
    }
  },
  handler: {
    // слушаем изменение состава детей
    childNodesModified: function(){
      if (!this.selection.itemCount && this.firstChild)
        this.firstChild.select();
    }
  }
});
```

### Привязка выбранного элемента списка к другому представлению

```js
var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;

var list = new Node({
  selection: true
});
var view = new Node();
list.selection.addHandler({
  itemsChanged: function(){
    view.setDelegate(this.pick());
  }
});

// альтернативное решение
// basis.js 1.3 и выше
var list = new Node({
  selection: true
});
var view = new Node({
  delegate: Value.from(list.selection, 'itemsChanged', 'pick()')
});
```

### Привязка к роутеру

```js
var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var router = require('basis.router');

var menu = new Node({
  selection: true,
  childNodes: [
    { name: 'foo' },
    { name: 'bar' },
    { name: 'baz' }
  ]
});
router.add('/:name', function(name){
  var child = basis.array.search(menu.childNodes, name, 'name');
  menu.selection.set(child);
});

// альтернативное решение
// basis.js 1.4 и выше
var menu = new Node({
  childClass: {
    selected: Value
      .from(router.route('/:name').param('name'))
      .compute(function(child, name){
        return child.name == name;
      })
  },
  childNodes: [
    { name: 'foo' }, // будет выбран если путь '/foo'
    { name: 'bar' }, // будет выбран если путь '/bar'
    { name: 'baz' }  // и т.д.
  ]
});
```

### Биндинги

В модуле `basis.ui` уже определены биндинги `selected` и `unselected`, в их описании нет необходимости. Здесь приведено их описание в качестве примера, как можно использовать состояние выделения в биндингах.

```js
var Node = require('basis.ui').Node;

var view = new Node({
  binding: {
    selected: {
      events: 'select unselect',
      getter: function(node){
        return node.selected;
      }
    },
    unselected: {
      events: 'select unselect',
      getter: function(node){
        return !node.selected;
      }
    }
  }
});
```

----

[TODO] hasOwnSelection/nullSelection
