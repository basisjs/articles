# Управление дочерними узлами

Модель `DOM` вводит удобную базу для манипуляции узлами. Однако в чистом виде этот подход порождает избыточный код. Для упрощения наиболее частых операций и автоматизации процессов в модуле `basis.dom.wrapper` вводится ряд расширений класической модели.

## Неявное создание

В спецификации DOM определено, что дочерние узлы должны создаваться явно. Но при построении это не всегда удобно и возможно (см [Привязка данных](#Привязка-данных)). Поэтому активно используется неявное создание дочерних узлов.

Процессом неявного создания узлов управляют два свойства `childClass` и `childFactory`. Первое свойство определяет минимально возможный класс для дочерних узлов. Другими словами, дочерний узел должен быть экземпляром этого класса или его потомка. Если при вставке значения в качестве дочернего узла это правило не выполняется (то есть при вызове методов `appendChild`, `insertBefore`, `replaceChild` или `setChildNodes`), то значение передается методу `childFactory`, который должен создать экземпляр нужного класса на основе этого значения. В случае, если этого не происходит или метод `childFactory` не определен – выбрасывается исключение.

```js
var Foo = basis.dom.wrapper.Node.subclass({
  // ...
});
var node = new basis.dom.wrapper.Node({
  childClass: Foo,
  childFactory: function(config){
    return new Foo(config);
  }
});

var a = node.appendChild(new Foo({
  data: { name: 'basis.js' }
}));
console.log(a instanceof Foo);
// console> true

var b = node.appendChild({
  data: { name: 'Я тоже буду экземпляром Foo' }
});
console.log(b instanceof Foo);
// console> true
```

Для большей гибкости, по умолчанию метод `childFactory` определен так:

```js
basis.dom.wrapper.Node.prototype.childFactory = function(config){
  return new this.childClass(config);
}
```

Таким образом, становится не необязательным определять этот метод, достаточно переопределить свойство `childClass`.

```js
// вместо
var Foo = basis.dom.wrapper.Node.subclass({
  // ...
});
var node = new basis.dom.wrapper.Node({
  childClass: Foo,
  childFactory: function(config){
    return new Foo(config);
  }
});

// можно короче
var node = new basis.dom.wrapper.Node({
  childClass: basis.dom.wrapper.Node.subclass({
    // ...
  })
});
```

Обычно `childFactory` переопределяется, если нужно создавать экземпляры разных классов, в зависимости от значения.

```js
var Node = basis.dom.wrapper.Node.subclass({
  // ...
});
var Folder = Node.subclass({
  childClass: Node,
  childFactory: function(config){
    if (config.childNodes)
      return new Folder(config);
    else
      return new Node(config);
  }
});

var node = new Folder({
  childNodes: [
    { 
      name: 'node'
    },
    {
      name: 'folder',
      childNodes: [
        {
          name: 'one more node'
        }
      ]
    }
  ]
});

console.log(node.firstChild instanceof Node);
// console> true
console.log(node.firstChild instanceof Folder);
// console> false

console.log(node.lastChild instanceof Node);
// console> true
console.log(node.lastChild instanceof Folder);
// console> true
```

В случае создания рекурсивных классов, когда дочерние узлы должны быть того же класса, что и создаваемый, можно воспользоваться хелпером `basis.Class.SELF`.

```js
var Node = basis.dom.wrapper.Node({
  childClass: basis.Class.SELF
});

// это позволяет избегать такого кода
var Node = basis.dom.wrapper.Node({
  // ...
});
Node.extend({
  childClass: Node
});
```

Если при вставке значение не является экземпляром нужного класса, действует еще одно правило: если значение является экземпляром `basis.data.Object`, то оно оборачивается в объект `{ delegate: [значение] }`.

```js
var dataObject = new basis.data.Object();
var node = new basis.dom.wrapper.Node();

// следующие две записи эквивалентны
node.appendChild(dataObject);
node.appendChild({
  delegate: dataObject
});
```

Если `childClass` приравнять `null`, то узел не сможет иметь дечерние узлы, а попытка добавить дочерний узел будет приводить к исключению.

## Привязка данных

Для автоматизации синхронизации некоторого [набора](basis.data.datasets.md) с `childNodes` используется свойство `dataSource`. Когда задано это свойство, то узел теряет способность управлять составом своих дочерних узлов.

> Вызов методов `removeChild`, `replaceChild`, `setChildNodes` и `clear` будет всегда приводить к исключению, а методов `appendChild`, `insertBefore` – будет приводить к исключению, если указанное значение не является членом набора или узла нет в `childNodes`.

Синхронизация обеспечивает каждому элементу набора определенный дочерний узел, при этом элемент набора выступает делегатом для своей пары, а у дочерних узлов нельзя изменить делегат. Порядок дочерних узлов не определен: можно упорядочивать узлы с помощью методов `appendChild` и `insertBefore`, или использовать сортировку и/или группировку.

При добавлении в набор новых элементов для них создаются новые дочерние узлы, при удалении – соотвествующие узлы разрушаются.

Cвойство `dataSource` изменяется методом `setDataSource`, при его изменении срабатывает событие `dataSourceChanged`. В качестве значения `dataSource` можно задать экземпляр класса `basis.data.ReadOnlyDataset` (или его потомка).

Начиная с версии `1.1` в качестве значения `dataSource` можно задавать значения, которые могут быть разрешены в набор, используя функцию [basis.data.resolveDataset](basis.data.datasets.md#resolvedataset).Если значение не является набором, то для него создается адаптер, который сохраняется в свойстве `dataSourceAdapter_` и отслеживает изменения в значении. Когда значение успешно разрешается в набор, то этот набор присваивает в `dataSource` и срабатывает событие `dataSourceChanged`.

```js
var Dataset = basis.require('basis.data').Dataset;
var Node = basis.require('basis.ui').Node;

var foo = new Dataset();
var bar = new Dataset();
var current = new basis.Token();
var view = new Node({
  dataSource: current,
  handler: {
    dataSourceChanged: function(){
      console.log('dataSourceChanged');
    }
  }
});

console.log(view.dataSource);
// > null
console.log(view.dataSourceAdapter_);
// > basis.data.DatasetAdapter { .. }

current.set(foo);
console.log(view.dataSource === foo);
// > 'dataSourceChanged'
// > true

current.set(bar);
console.log(view.dataSource === bar);
// > 'dataSourceChanged'
// > true

view.setDataSource(bar);
console.log(view.dataSource === bar);
// > true
console.log(view.dataSourceAdapter_ === null);
// > true
```

Существует возможность получить дочерние узлы в виде набора. Для этого используется метод `getChildNodesDataset`. Метод возвращает экземпляр `basis.dom.wrapper.ChildNodesDataset`. Экземпляр создается при первом вызове метода, а последующие вызовы возвращают тот же экземпляр. Такой набор синхронизирует состав дочерних узлов с составом своих элементов и существует до тех пор, пока существует узел, который его породил.

> В связи с тем, что наборы являются неупорядоченным множеством, то узлы в наборе возвращаемом методом `getChildNodesDataset` не повторяют порядок в `childNodes`.

По умолчанию, при удалении элемента из набора (или при смене набора), ассоцированный с ним дочерний узел разрушается. Этим поведением управляет свойство `destroyDataSourceMember`, которое по умолчанию равно `true` (разрушать ассоциированный узел). Если нужно сохранять узлы, необходимо выставить этот флаг в `false`. Обычно это нужно при переиспользовании узлов, когда есть разные выборки и выгоднее оставлять узлы в кеше, нежели пересоздавать их заново. В такой ситуации, необходимо организовывать пул узлов (кеш), для чего хорошо подходят карты (`basis.data.KeyObjectMap`), и изменить `childFactory` так, чтобы метод использовал такой пул.

```js
var Node = basis.require('basis.ui').Node;
var DataObject = basis.require('basis.data').Object;
var Dataset = basis.require('basis.data').Dataset;

var items = basis.array.create(5, function(idx){
  return new DataObject({ data: { name: idx } });
});
var foo = new Dataset({ items: items.slice(0, 3) });
var bar = new Dataset({ items: items.slice(2, 5) });
var model2node = new basis.data.KeyObjectMap({
  itemClass: Node.subclass({
    init: function(){
      Node.prototype.init.call(this);
      console.log('create', this.data.name);
    },
    destroy: function(){
      console.log('destroy', this.data.name);
      Node.prototype.destroy.call(this);
    }
  })
});
var view = new Node({
  destroyDataSourceMember: false,  // иначе удаляемые узлы будут разрушаться
  dataSource: foo,
  childFactory: function(config){
    return model2node.resolve(config.delegate);
  }
});
// > create 0
// > create 1
// > create 2

foo.set();
view.setDataSource(bar);
// > create 3
// > create 4

view.destroyDataSourceMember = true;  // устанавливаем разрушение по умолчанию
view.setDataSource(foo);
// > destroy 4
// > destroy 3
// > destroy 2
```

> Порядок создания и разрушения узлов может быть произвольным, так как наборы являются неупорядоченными.

## Состояние

`AbstractNode` наследует от `basis.data.AbstractData` [механизм состояния](basis.data.md#Состояние). Но этот механизм отвечает за состояние данных узла (которые хранятся в свойстве `data`).

Обслуживание дочерних узлов нередко сопровождается процессами, для отражения состояния которых используется свойство `childNodesState`. Значения и логика та же, что и у `state`. Меняется состояние методом `setChildNodesState`, а при изменении значения выбрасывается событие `childNodesStateChanged`.

Если узлу задан некоторый набор (свойство `dataSource`), то `childNodesState` синхронизируется с его свойством `state` (в направлении `node.dataSource.state` -> `node.childNodesState`).
