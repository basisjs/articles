# basis.data.KeyObjectMap

Класс `basis.data.KeyObjectMap` представляет собой класс, чьи экземпляры хранят информацию об отношении некоторого значения к другому значению.

В общем смысле, это карта соотвествия. Значением (ключом) может выступать произвольное значение, в то время как значением должен являться экземпляр [`basis.event.Emitter`](basis.event.md#emitter) (на данный момент). Соотношение ключа и значения вычисляется один раз (при первом "запросе") и кешируется. При этом, в случае разрушения экземпляра значения связь удаляется из карты.

> Класс достаточно давний, и тем не менее долгое время оставался "в тени". Изменения в последних версиях `basis.js` привели к тому, что класс оказался весьма полезным и востребованным. Предполагается его дальнейшее развитие (улучшение интерфейса и исправление различных "нестыковок", так как он устарел по отношению к другим решениям) и появление его потоков, решающих новые задачи.

## Интерфейс

Класс предоставляет методы:

- `get(key, autocreate)` – метод возвращает ассоцированное значение для `key`; если такого значение нет, то возвращается `undefined`; если передан параметр `autocreate`, то, в случае отсутсвия значения, вызывается метод `create` с переданными значениями, а результат его выполенения сохраняется как ассоциированное значение.
- `create(key, config)` – метод вызывается, когда для заданного значения (параметра `key`) не найдено значения; значение `config` может использовать как дополнительный объект конфигурации (передается в `get` как `autocreate`), но по умолчанию не используется.
- `resolve(value)` – метод пытается вернуть ассоцированное значение для `value`, а если его нет, то создать новое значение; в отличае от `get` этот метод всегда возвращает значение, вне зависимости от того, существовало ли оно до этого.

Особое внимание стоит уделить методу `resolve`. Так как это основной, который используется для получения значения, в виду того, что гарантирует получение значения. Его реализация по умолчанию выглядит так:

```js
basis.data.KeyObjectMap.prototype.resolve = function(value){
  return this.get(this.keyGetter(value), value);
}
```

Можно заметить, что в качестве "ключа" используется результат выполнения `keyGetter`. По умолчанию, это свойство хранит функцию, которая возвращает значение без изменений (`basis.fn.$self`). Таким образом переданное значение и является ключом (по умолчанию), а так же является кофигурацией.

Если метод `create` не переопределен, то, в качестве значения, создается экземпляр `basis.data.Object`. Класс значения по умолчанию можно задать через свойство `itemClass` (по умолчанию `basis.data.Object`). Конфигурация для создания зависит от типа (см "Разрешение ключевого значения").

По умолчанию, при разрушении карты, разрушаются и все его значения. Это исторически сложившееся поведение. С версии `1.3` этим поведением можно управлять через свойство `autoDestroyMembers` (по умолчанию `true`). Если выставить его в `false`, то значения не будут разрушены при разрушении карты.

Так же нужно помнить, что при разрушении объектов являющимися значениями, они удаляются из карты. Это делает карты удобными для хнанения значений:

```js
var map = new basis.data.KeyObjectMap({
  create: function(key){
    return new DataObject({ data: { value: key } })
  }
});

console.log(map.get(1));
// > undefined

console.log(map.resolve(1));
// > basis.data.Object { data: { value: 1 } }

console.log(map.get(1) === map.resolve(1));
// > true

map.resolve(1).destroy();
console.log(map.get(1));
// > undefined
```

> В настоящий момент, разрушения значения, которое является ключом не ведет к удалению из карты. Это будет исправлено в будущих версиях `basis.js`.

## Разрешение ключевого значения

Ключом может являться произвольное значение. Но в зависимости от типа значения, меняется способ его разрешения:

– если значение является экземпляром `basis.data.Object`, то в качестве значения ключа используется свойство `basisObjectId`;
– в ином случае используется строковое представление значения.

Если значение является экземпляром `basis.data.Object`, то оно преобразуется в конфигурацию `{ delegate: value }` или в `{ data: { id: value, title: value } }`. Обычно это подходящие конфигурации для создания нового экземпляра класса `basis.data.Object`, который является классом значения по умолчанию.

> Такое поведение схоже с разрешением признака группы в `basis.dom.wrapper.GroupingNode` и подмножества в `basis.data.dataset.Split` и `basis.data.dataset.Cloud`.

## Использование

Карты используются в качестве кеша (переиспользования значений) или для получения одних и тех же значений в разных частях кода в условиях конкуренции.

Нередко нужно сохранять значения, так как они могут нести информацию о состоянии. Обычно в качестве таких значений выступают экземпляры `basis.ui.Node` и выгодно сохранять их экземпляры, вместо пересоздания. В этом случае, так же необходимо запретить разрушение дочерних узлов через свойство `destroyDataSourceMember`, если используется `dataSource`.

```js
var Node = basis.require('basis.ui').Node;
var DataObject = basis.require('basis.data').Object;
var Dataset = basis.require('basis.data').Dataset;
var KeyObjectMap = basis.require('basis.data').KeyObjectMap;

var items = [
  new DataObject(),
  new DataObject(),
];
var dataset = new Dataset();
var map = new KeyObjectMap({
  itemClass: Node.subclass({
    init: function(){
      console.log('create');
      Node.prototype.init.call(this);
    },
    destroy: function(){
      console.log('destroy');
      Node.prototype.init.call(this);
    }
  })
});
var view = new Node({
  destroyDataSourceMember: false,
  dataSource: dataset,
  childFactory: function(config){
    return map.resolve(config.delegate);
  }
});

dataset.set(items);
// > create
// > create

dataset.clear();

dataset.set(items);

dataset.add(new DataObject());
// > create
```

Иногда требуется, например, синхронизировать некоторый набор с `selection` узла, который выводит некоторый полный набор. В этом случае не известно что будет раньше, создадутся дочерние узлы через `dataSource` и `childFactory` или же синхронизируется `selection`. В любом случае, должны получиться одни и те же узлы (`basis.ui.Node`):

```js
var Node = basis.require('basis.ui').Node;
var DataObject = basis.require('basis.data').Object;
var Dataset = basis.require('basis.data').Dataset;
var KeyObjectMap = basis.require('basis.data').KeyObjectMap;

var items = basis.array.create(3, function(){
  return new DataObject();
});
var dataset = new Dataset({
  items: items
});

var model2node = new basis.data.KeyObjectMap({
  itemClass: basis.ui.Node.subclass({
    init: function(){
      console.log('create');
      basis.ui.Node.prototype.init.call(this);
    },
    destroy: function(){
      console.log('destroy');
      basis.ui.Node.prototype.init.call(this);
    }
  })
});

var view = new basis.ui.Node({
  destroyDataSourceMember: false,
  dataSource: dataset,
  selection: { multiple: true },
  childFactory: function(config){
    return model2node.resolve(config.delegate);
  }
});
// > create
// > create
// > create

view.selection.set(items.slice(1, 2).map(function(item){
  return model2node.resolve(item);
}));
```
