# Доступность (disable/enable)

В интерфейсах нередко возникает необходимость блокировать часть интерфейса, чтобы пользователь не мог совершить определенные действия. Для этого используется механизм доступности.

<!-- MarkdownTOC -->

- [Принцип работы](#Принцип-работы)
- [Контекст](#Контекст)
- [Реактивные значения](#Реактивные-значения)
- [Примеры](#Примеры)
  - [Недоступность при загрузке данных](#Недоступность-при-загрузке-данных)
  - [Биндинги](#Биндинги)

<!-- /MarkdownTOC -->

## Принцип работы

Если узел недоступен (`disabled`), он не должен реагировать на пользовательские действия. Недоступность не распространяется на логику приложения, то есть не влияет на действия, которые иницируются программно. Поэтому нужно проверять доступность узлов и игнорировать пользовательский ввод в зависимости от этого, если это необходимо.

Для задания состояния "недоступен" используется свойство `disabled`. Для изменения значения этого свойства используются методы:

- `disable()` – меняет значение на `true`;
- `enable()` - меняет значение на `false`;
- `setDisabled(state)` – где `state` приводится к `boolean` и это значение присваивается.

Все методы возвращают `true`, если значение было изменено, и `false` в противном случае.

```js
var Node = require('basis.ui').Node;
var view = new Node();

console.log(view.disabled);
// > false

view.disable();
console.log(view.disabled);
// > true

view.enable();
console.log(view.disabled);
// > false

view.setDisabled(123);
console.log(view.disabled);
// > true
```

Значение свойства `disabled` может быть выставлено при создании экземпляра. По умолчанию оно равно `false`.

```js
var Node = require('basis.ui').Node;
var foo = new Node();
var bar = new Node({ disabled: true });
var baz = new Node({ disabled: false });

console.log(foo.disabled);
// > false
console.log(bar.disabled);
// > true
console.log(baz.disabled);
// > false
```

Когда узел становится недоступным, то выбрасывается событие `disable`, а когда доступным – событие `enable`. События не выбрасываются при создании экземпляра.

```js
var Node = require('basis.ui').Node;
var view = new Node({
  handler: {
    disable: function(){
      console.log('view is disabled');
    },
    enable: function(){
      console.log('view is enabled');
    }
  }
});

view.disable();
// > view is disabled

view.disable();
// события не будет, т.к. view уже недоступно

view.enable();
// > view is enabled
```

## Контекст

На доступность узла влияет не только значение собственного свойство `disabled`, но и значения `disabled` вышестоящих узлов (`ancestors`). Другими словами зависит от контекста.

Узел со значением свойства `disabled` равным `true` влияет на свое поддерево, то есть на свои дочерние узлы, дочерние узлы дочерних узлов и т.д., это распространяется и на все сателлиты. Для распространения влияния используется свойство `contextDisabled`.

> Введение дополнительного свойства обусловлено тем, что каждый узел имеет свое собственное значение свойства `disabled`, которое зависит от определенной логики. Его нельзя менять из-за изменений в контексте, иначе при разблокировке вышестоящего узла (установке `disable` в значение `false`) будет потеряно настоящее состояние узла, который, возможно, должен остаться заблокированным.

Значение свойства `contextDisabled` обновляется автоматически. Оно хранит `true`, если среди вышестоящих узлов есть хотя бы один с `disabled` равным `true`. Иначе в нем хранится `false`.

```js
var Node = require('basis.ui').Node;
var list = new Node({
  childNodes: [
    new Node()
  ]
});

console.log(list.disabled);
// > false
console.log(list.contextDisabled);
// > false
console.log(list.firstChild.disabled);
// > false
console.log(list.firstChild.contextDisabled);
// > false

list.setDisabled(true);

console.log(list.disabled);
// > true
console.log(list.contextDisabled);
// > false
console.log(list.firstChild.disabled);
// > false
console.log(list.firstChild.contextDisabled);
// > true
```

Принцип обновления `contextDisabled`: при изменении свойства `disabled` узла, на то же значение меняется `contextDisabled` для всех нижестоящих узлов. При этом поддеревья узлов с `disabled` равным `true` игнорируются, так как такие узлы создают собственный контекст.

При отвязывании узла от его родителя или [владельца](basis.dom.wrapper_owner.md) `contextDisabled` не изменяется (чтобы избежать лишних событий). Но при привязывании узла к новому родителю или владельцу `contextDisabled` меняется согласно текущему состоянию контекста.

```js
var Node = require('basis.ui').Node;
var child = new Node();
var list = new Node({
  disabled: true,  // список заблокирован по умолчанию
  childNodes: [
    child
  ]
});

console.log(child.contextDisabled);
// > true

list.removeChild(child);
console.log(child.contextDisabled);
// > true

list.enable();
list.appendChild(child);
console.log(child.contextDisabled);
// > false
```

Узел считается недоступным если его свойство `disabled` или свойство `contextDisabled` равно `true`. Пример функции проверяющей доступность:

```js
function isViewDisabled(view){
  return view.disabled || view.contextDisabled;
}
```

Но в такой функции нет необходимости, так как у узлов есть метод `isDisabled()`.

```js
var Node = require('basis.ui').Node;
var list = new Node({
  childNodes: [
    new Node()
  ]
});

console.log(list.isDisabled());
// > false
console.log(list.firstChild.isDisabled());
// > false

list.disable();

console.log(list.isDisabled());
// > true
console.log(list.firstChild.isDisabled());
// > true
```

При изменении `contextDisabled` так же выбрасывается событие `disable` или `enable`. Фактически эти события выбрасываются, когда меняется возвращаемый результат метода `isDisabled()`.

```js
var Node = require('basis.ui').Node;
var LogNode = Node.subclass({
  emit_disable: function(){
    Node.prototype.emit_disable.call(this);
    console.log(this.name, 'disabled');
  },
  emit_enable: function(){
    Node.prototype.emit_enable.call(this);
    console.log(this.name, 'enabled');
  }
});

var list = new LogNode({
  name: 'list',
  childNodes: [
    new LogNode({ name: 'item1' }),
    new LogNode({ name: 'item2' })
  ],
  satellite: {
    foo: new LogNode({ name: 'foo' })
  }
});

list.disable();
// > item1 disabled
// > item2 disabled
// > foo disabled
// > list disabled

list.firstChild.disable();
// событий не будет, первый ребенок и так уже недоступен

list.enable();
// > item2 enabled
// > foo enabled
// > list enabled
// item1 остался недоступным
```

Использование контекста избавляет от необходимости делать недоступными каждое отдельное представление или элемент управления. Для этого достаточно сделать недоступным лишь одно "главное" представление отвечающее за контекст. Например, форма с полями: не нужно делать недоступным каждое поле, достаточно сделать недоступной только форму, ее поля так же станут недоступными.

## Реактивные значения

Начиная с версии `1.4` в качестве значения `disabled` можно задать объект с интерфейсом [`binding bridge`](bindingbridge.md) (`bb-value`). В этом случае `disabled` будет автоматически синхрозироваться с таким объектом (его значение приводится к `boolean`). При этом `disabled` по прежнему хранит `true` или `false`, а при изменениях срабатывают события `disable` и `enable`. Связь с `bb-value` "прячется" в приватном свойстве `disabledRA_`, в котором хранится специальный адаптер-наблюдатель.

```js
var Node = require('basis.ui').Node;

var someValue = new basis.Token(false);
var view = new Node({
  disabled: someValue
});

console.log(view.disabled);
// > false

someValue.set(true);
console.log(view.disabled);
// > true
```

Можно использовать эту возможность для более сложных сценариев. Например, блокировать кнопку, если у владельца нет [выбранных узлов](basis.dom.wrapper_selection.md).

```js
var Node = require('basis.ui').Node;

var list = new Node({
  selection: true,
  childNodes: [
    { name: 'foo' },
    { name: 'bar' }
  ],
  satellite: {
    deleteButton: new Node({
      disabled: Value
        .factory('ownerChanged', 'owner.selection')
        .pipe('itemsChanged', function(selection){
          return !selection.itemCount;
        })
    })
  }
});

console.log(list.selection.itemCount);
// > 0
console.log(list.satellite.deleteButton.disabled);
// > true

list.firstChild.select();
console.log(list.selection.itemCount);
// > 1
console.log(list.satellite.deleteButton.disabled);
// > false

list.selection.clear();
console.log(list.selection.itemCount);
// > 0
console.log(list.satellite.deleteButton.disabled);
// > true
```

Стоит принимать во внимание следующие особенности использования `bb-value` в качестве значения `disabled`:

- вызов методов `disable()` и `enable()` не меняет состояние `disabled` (в режиме разработки выводится предупреждение), когда для него установлено `bb-value`;
- для привязки и сбрасывания `bb-value` необходимо использовать метод `setDisabled(newValue)`.

## Примеры

### Недоступность при загрузке данных

```js
var Node = require('basis.ui').Node;
var STATE = require('basis.data').STATE;

var view = new Node({
  handler: {
    stateChanged: function(){
      this.setDisabled(this.state == STATE.PROCESSING);
    }
  }
});

// альтернативное решение
// basis.js 1.4
var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var STATE = require('basis.data').STATE;

var view = new Node({
  disabled: Value.factory('stateChanged', function(node){
    return node.state == STATE.PROCESSING;
  }
});
```

### Биндинги

В модуле `basis.ui` уже определены биндинги `disabled` и `enabled`, в их описании нет необходимости. Здесь приведено их описание в качестве примера, как можно использовать доступность в биндингах.

```js
var Node = require('basis.ui').Node;

var view = new Node({
  binding: {
    disabled: {
      events: 'disable enable',
      getter: function(node){
        return node.isDisabled();
      }
    },
    enabled: {
      events: 'disable enable',
      getter: function(node){
        return !node.isDisabled();
      }
    }
  }
});
```
