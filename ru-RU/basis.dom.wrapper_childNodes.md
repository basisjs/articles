# Управление дочерними узлами

Модель `DOM` вводит удобную базу для манипуляции узлами. Однако в чистом виде этот подход порождает избыточный код. Для упрощения наиболее частых операций и автоматизации процессов в модуле `basis.dom.wrapper` вводится ряд расширений класической модели.

## Неявное создание

В спецификации DOM определено, что дочерние узлы должны создаваться явно. Но при построении это не всегда удобно и возможно (см [Привязка данных](#Привязка-данных)). Поэтому активно используется неявное создание дочерних узлов.

Процессом неявного создания узлов управляют два свойства `childClass` и `childFactory`. Первое свойство определяет минимально возможный класс для дочерних узлов. Другими словами, дочерний узел должен быть экземпляром этого класса или его потомка. Если при вставке значения в кажестве дочернего узла это правило не выполняется (то есть при вызове методов `appendChild`, `insertBefore`, `replaceChild` или `setChildNodes`), то значение передается методу `childFactory`, который должен создать экземпляр нужного класса на основе этого значения. В случае, если этого не происходит или метод `childFactory` не определен – выбрасывается исключение.

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

Таким образом, становится не необязательным опрелять этот метод, достаточно переопределить свойство `childClass`.

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

[TODO] destroyDataSourceMember & childFactory + KeyObjectMap

Cвойство `dataSource` изменяется методом `setDataSource`, при его изменении срабатывает событие `dataSourceChanged`. В качестве значения `dataSource` можно задать экземпляр класса `basis.data.AbstractDataset` или его потомка.

Начиная с версии 0.10 в качестве значения можно задавать экземпляр класса `basis.data.DatasetWrapper`, который сохраняется в свойстве `dataSourceWrapper_` и синхронизирует свое свойство `dataset` со свойством `dataSource` узла (в направлении `node.dataSourceWrapper_.dataset` -> `node.dataSource`).

При установленном значении `dataSource`, состояние набора (его свойство `state`) синхронизируется со свойстом узла `childNodesState` (в направлении `node.dataSource.state` -> `node.childNodesState`).

Существует возможность получить дочерние узлы в виде набора. Для этого используется метод `getChildNodesDataset`, который возвращает экземпляр `basis.dom.wrapper.ChildNodesDataset`. Экземпляр создается при первом вызове метода, а дальнейшие вызовы метода возвращают тот же экземпляр. Такой набор синхронизирует состав дочерних узлов с составом своих элементов и существует до тех пор, пока существует узел, который его породил.

## Состояние

`AbstractNode` наследует от `basis.data.AbstractData` [механизм состояния](basis.data.md#Состояние). Но этот механизм отвечает за состояние собственных данных узла.

Обслуживание дочерних узлов часто сопровождается некоторыми процессами, для отражения состояния этих процессов используется свойство `childNodesState`. Значения и логика та же, что и у `state`. Меняется состояние методом `setChildNodesState`. При изменении значения выбрасывается событие `childNodesStateChanged`.

Если узлу задан некоторый набор (свойство `dataSource`), то `childNodesState` синхронизируется с его свойством `state` (в направлении `node.dataSource.state` -> `node.childNodesState`).
