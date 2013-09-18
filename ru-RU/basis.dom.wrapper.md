# basis.dom.wrapper

Данное пространство имен вводит классы и хелперы для организации структуры интерфейса, в основе которой находится модель DOM. Структура интерфейса приложения на `basis.js` представляет собой одно большое дерево, то есть все элементы интерфейса так или иначе связаны между собой.

Так же этот модуль описывает наиболее часто используемые паттерны, такие как сортировка, группировка, enable/disable, selection, привязка данных и другие.

Отправной точкой является класс `basis.dom.wrapper.AbstractNode`, описывающий базовый интерфейс для остальных классов.

## AbstractNode

### DOM

Основой для организации структуры являвляется модель DOM. `AbstractNode` не описывает логику работы методов, но определяет базовый интерфейс. В `basis.js` реализована не вся спецификация DOM, а взяты лишь базовые свойства и методы, которые позволяют организовать структуру и взаимодействие компонент между собой.

Поддерживаемые свойства:

  * childNodes

  * firstChild

  * lastChild

  * nextSibling

  * previousSibling

  * parentNode

![Поддерживаемые DOM свойства](img/dom-properties.png)

Поддерживаемые методы

  * appendChild(newChild)

  * insertBefore(newChild, refChild)

  * removeChild(oldChild)

  * replaceChild(newChild, oldChild)

Перечисленные методы и свойства работают приближено к тому, как работает нативный DOM (описано в спецификации).

Помимо перечисленных методов, есть еще два дополнительных метода:

  * clear(alive) – метод удаляет все дочерние узлы, по умолчанию (`alive` == `false`), удаляемые узлы разрушаются; если это не является желаемым поведением, нужно передать `true` в качестве параметра;

  * setChildNodes(nodes) – устанавливает новый список дочерних узлов: метод очищает `childNodes` и для каждого элемента массива nodes выполняется `insertBefore`.

При изменении списка дочерних узлов срабатывает событие `childNodesModified`, которое предоставляет обработчикам дельту изменений (объект, который содержит два свойства `inserted` массив вставленных узлов, если есть, и deleted – массив удаленных узлов).

Можно добавлять обработчики событий дочерним узлам (`childNode`) и владельцу (`parentNode`) через свойство `listen`.

### Неявное создание узлов

В спецификации DOM определено, что дочерние узлы должны быть созданы явно. Но при построении это не всегда удобно и не всегда удобно (см [Данные и childNodes](#Данные-и-childnodes)).

Процессом неявного создания узлов управляют два свойства `childClass` и `childFactory`. Первое свойство определяет минимально возможный класс для дочерних узлов, то есть дочерний узел должен быть экземпляром этого класса или его потомка. Если при вставке значения в кажестве дочернего узла это правило не выполняется (то есть при вызове методов `appendChild`, `insertBefore`, `replaceChild` или `setChildNodes`), то значение передается методу `childFactory`, который должен образовать экземпляр нужного класса на основе этого значения. В случае, если этого не происходит или метод `childFactory` не определен – выбрасывается исключение.

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

По этой причине, часто не требуется переопрелять этот метод, достаточно переопределить свойство `childClass`.

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

`childFactory` становится особенно полезным, если нужно создавать экземпляры разных классов, в зависимости от значения.

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

В случае создания рекурсивных классов, когда дочерние узлы должны быть того же класса, можно воспользоваться хелпером `basis.Class.SELF`.

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

Так же действует еще одно правило, если вставляемое значение не является экземпляром нужного класса, но является экземпляром `basis.data.Object`, то оно оборачивается в объект `{ delegate: [значение] }`.

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

### Сателлиты

Традиционная модель DOM хорошо описывает списки, любой узел может содержать произвольное количество (не ограниченное сверху) улов опреденного класса или группы классов. Однако не описывает случаи единичного вхождения зависимого объекта, который может существовать максимум в единственном экземпляре. Поэтому в `basis.js` вводится собственный паттерн для решения этой задачи – сателлиты (спутники).

> Если посмотреть на HTML, то можно заметить ряд тегов, которые допускают единственное вхождение определенного тега. Например, тег `<base>` может присутсвовать в единственном экземпляре, если их несколько, обрабатывается первый в документе, второй и последущие игнорируются. У `<table>` может быть только один `<thead>` и `<tfoot>`, которые вне зависимости от места указания в разметке "прибиваются" в начало и конец таблицы соотвественно, все остальные воспринимаются как обычные `<tbody>`. В любом сложном интерфейсе гораздо больше уникальных классов, со своей спецификой, которые имеют необходимость в единичных именнованых вхождениях дочерних объектов. Паттерн сателитов – попытка унифицировать этот подход.

Сателлиты хранятся в свойстве `satellite`, который представляет собой объект. Ключи – это имена сателлитов, а значения – ссылки на объекты. Задать сателлит можно при создании экземпляра или методом `setSatellite(name, satellite)`, где:

  * name – имя сателлита;

  * satellite – новое значение для сателлита, должен быть экземпляр `basis.dom.wrapper.AbstractNode` иначе приравнивается `null`.

Сателлит знает о своем владельце и хранит ссылку на него в свойстве `owner`. У сателлита может быть только один владелец. Сателлиты могут передаваться от одного владельца другому. Если сателлитом завладевает другой узел, то у предыдущего владельца на него удаляется ссылка.

```js
basis.require('basis.dom.wrapper');

var node1 = new basis.dom.wrapper.Node({
  satellite: {
    example: new basis.dom.wrapper.Node({
      name: 'example'
    })
  }
});
var node2 = new basis.dom.wrapper.Node();

console.log(node1.satellite.example);
// console> basis.dom.wrapper.Node { name: 'example', ... }
console.log(node1.satellite.example.owner === node1);
// console> true

node2.setSatellite('somename', node1.satellite.example);
console.log(node1.satellite.example);
// console> null
console.log(node2.satellite.somename);
// console> basis.dom.wrapper.Node { name: 'example', ... }
console.log(node2.satellite.somename.owner === node2);
// console> true
```

Когда добавляется или удаляется сателлит, у его владельца срабатывает событие `satelliteChanged` с двумя параметрами: `name` – имя сателлита, и `oldSatellite` – значение `owner.satellite[key]` до изменения. При изменении владельца срабатывает событие `ownerChanged`, которое передает обработчикам предыдущее значение `owner`.

При разрушении владельца, разрушаются и все его сателлиты.

Можно добавлять обработчики событий сателлитам (`satellite`) и владельцу (`owner`) через свойство `listen`.

### Автоматические сателлиты

Свойство `satelliteConfig` позволяет автоматизировать создание сателлитов при создании владельца, и настроить условия при которых он должен существовать (создаваться).

```js
basis.require('basis.dom.wrapper');

var NodeWithSatellite = basis.dom.wrapper.Node.subclass({
  satelliteConfig: {
    example: {
      instanceOf: basis.dom.wrapper.Node.subclass({
        className: 'DemoSatellite',
        caption: 'Static caption'
      })
    }
  }
});

var foo = new NodeWithSatellite();
var bar = new NodeWithSatellite();

console.log(foo.satellite.example);
// console> [object DemoSatellite]
console.log(bar.satellite.example);
// console> [object DemoSatellite]
console.log(foo.satellite.example === bar.satellite.example);
// console> false
```

При определении сателлита через `satelliteConfig` можно указать следующие опции:

  * hook – объект, ключи которого названия событий, когда должны перевычисляться `existsIf`, `delegate` и `dataSource`; значение по умолчанию `{ update: true }`, то есть функции перевычисляются при выбрасывании события `update` у владельца;

  * existsIf – функция, определяющая должен ли существовать сателлит, на вход получает ссылку на владельца; если значение не задано, то сателлит существует всегда, пока существует владелец;

  * instanceOf – класс экземпляра сателлита; по умолчанию используется `basis.dom.wrapper.AbstractNode`;

  * config – объект или фукнция возвращающая объект, конфиг для создания сателлита; функции передается ссылка на владельца;

  * delegate – функция для определения делегата, который должен быть назначен сателлиту (автоматизация); функции передается ссылка на владельца;

  * dataSource – функция для определения набора, который должен быть назначен сателлиту в качестве `dataSource`; функции передается ссылка на владельца.

Все параметры являются опциональными. Если задается только `instanceOf`, можно использовать более короткую запись.

```js
// полная запись
var NodeWithSatellite = basis.dom.wrapper.Node.subclass({
  satelliteConfig: {
    example: {
      instanceOf: basis.dom.wrapper.Node.subclass({ .. })
    }
  }
});

// эквивалент, сокращенная запись
var NodeWithSatellite = basis.dom.wrapper.Node.subclass({
  satelliteConfig: {
    example: basis.dom.wrapper.Node.subclass({ .. })
  }
});
```

Следующий пример демострирует представление, отображающее информацию о пользователе. Список групп создается только тогда, когда в информации пользотеля есть свойство `groups`, содержащее набор групп.

```js
basis.require('basis.ui');

var view = new basis.ui.Node({
  template: basis.resource('path/to/template.tmpl'),
  binding: {
    name: 'data:',
    groups: 'satellite:'
  },
  satelliteConfig: {
    groups: {
      existsIf: function(owner){
        return owner.data.groups instanceof basis.data.AbstractDataset;
      },
      dataSource: function(owner){
        return owner.data.groups;
      },
      instanceOf: basis.ui.Node.subclass({
        template: basis.resource('path/to/group-list.tmpl'),
        childClass: {
          template: basis.resource('path/to/group.tmpl'),
          binding: {
            name: 'data:'
          }
        }
      })
    }
  },
  data: {
    name: 'basis.js',
    groups: new basis.data.Dataset()
  }
});

console.log(view.satellite.groups != null);
// console> true

view.update({ groups: null });
console.log(view.satellite.groups != null)
// console> false
```

### parentNode vs. owner

У узла может быть установлен либо родительский узел (свойство `parentNode`), либо владелец (свойство `owner`). При вызове методов, которые меняют `parentNode` (методы `appendChild`, `insertBefore`, `replaceChild`, `setChildNodes`) при установленном `owner` (не равным `null`) или меняют `owner` (методы `setOwner`, `setSatellite`) при установленном `parentNode`, выбрасывается исключение.

> Наличие уставноленных обоих свойств `parentNode` и `owner` создает конфликтные ситуации, когда родитель и владелец одновременно влияют на узел или узел заимствует какие то данные из родителя или владельца. Так же это делает возможным вместо дерева получить граф содержащий циклы (рекурсия).

## Привязка данных

### Собственные данные

Данные узла хранятся в свойстве `data`, а для привязки данных, относящих к самому узлу, используется [делегирование](basis.data.Object.md#Делегирование). Эти способности `AbstractNode` наследует от [basis.data.Object](basis.data.Object.md) и они работают без изменений. Таким образом, узлы интерфейса могут сами выступать в качестве моделей данных.

Единственное, что добавляет `AbstractNode` в отношении собственных данных - это свойство `autoDelegate`. Данное свойство определяет должен ли экземпляр делегировать родителя или владельца. Свойство может принимать следующие значения:

  * basis.dom.wrapper.DELEGATE.NONE – нет автоматического делегирования, значение по умолчанию;

  * basis.dom.wrapper.DELEGATE.PARENT – узел должен делегировать своего родителя (`parentNode`);

  * basis.dom.wrapper.DELEGATE.OWNER – узел должен делегировать своего владельца (`owner`);

  * basis.dom.wrapper.DELEGATE.ANY – узел должен делегировать своего родителя или владельца (всегда возможен один вариант, так как `parentNode` и `owner` не могут быть установлены одновременно).

Вместо `basis.dom.wrapper.DELEGATE.ANY` можно использовать значение `true`.

```js
var autoDelegateNode = new basis.dom.wrapper.Node({
  autoDelegate: true
});
var parent = new basis.dom.wrapper.Node();
var owner = new basis.dom.wrapper.Node();

console.log(autoDelegateNode.delegate);
// console> null

parent.appendChild(autoDelegateNode);
console.log(autoDelegateNode.parentNode === parent);
// console> true
console.log(autoDelegateNode.delegate === parent);
// console> true

parent.removeChild(autoDelegateNode); // если узел не удалить у parent,
autoDelegateNode.setOwner(owner);     // то установка владельца вызовет исключение
console.log(autoDelegateNode.owner === owner);
// console> true
console.log(autoDelegateNode.delegate === owner);
// console> true
```

Делегат назначается при изменении соответствующего свойства (`parentNode` и/или `owner`), но после этого изменения можно выставить произвольный делегат, используя метод `setDelegate`.

### Данные и childNodes

Для автоматизации синхронизации некоторого [набора](basis.data.datasets.md) с `childNodes` используется свойство `dataSource`. Когда задано это свойство, то узел теряет способность управлять составом дочерних узлов.

> Вызов методов `removeChild`, `replaceChild`, `setChildNodes` и `clear` будет всегда приводить к исключению, а методов `appendChild`, `insertBefore` – будет приводить исключению, если указывать узлы, которых нет в `childNodes`.

Синхронизация обеспечивает каждому элементу набора определенный дочерний узел, при этом элемент набора выступает делегатом для своей пары, а дочерних узлов нельзя изменить делегат. Порядок дочерних узлов не определен: можно упорядочивать узлы с помощью методов `appendChild` и `insertBefore`, либо же использовать сортировку и/или группировку.

При добавлении в набор новых элементов для них создаются новые дочерние узлы, при удалении – соотвествующие узлы разрушаются.

[TODO] destroyDataSourceMember & childFactory + KeyObjectMap

Cвойство `dataSource` изменяется методом `setDataSource`, при его изменении срабатывает событие `dataSourceChanged`. В качестве значения `dataSource` можно задать экземпляр класса `basis.data.AbstractDataset` или его потомка.

Начиная с версии 0.10 в качестве значения так же можно задать экземпляр класса `basis.data.DatasetWrapper`, который сохраняется в свойстве `dataSourceWrapper_` и синхронизирует свое свойство `dataset` со свойством `dataSource` узла (в направлении `dataset` -> `dataSource`).

При установленном значении `dataSource`, состояние набора (свойство `state`) синхронизируется со свойстом `childNodesState` узла (в направлении `state` -> `childNodesState`).

Существует возможность получить дочерние узлы в виде набора. Для этого используется метод `getChildNodesDataset`, который возвращает экземпляр `basis.dom.wrapper.ChildNodesDataset`. Экземпляр создается при первом вызове метода, а дальнейшие вызовы метода возвращают тот же экземпляр. Такой набор синхронизирует состав дочерних узлов с составом своих элементов и существует до тех пор, пока существует узел.

### Состояние и childNodes

`AbstractNode` наследует от `basis.data.AbstractData` [механизм состояния](basis.data.md#Состояние). Но этот механизм отвечает за состояние собственных данных узла.

Обслуживание дочерних узлов часто сопровождается некоторыми процессами, для отражения состояния этих процессов используется свойство `childNodesState`. Значения и логика та же самая, что и у `state`. Меняется состояние методом `setChildNodesState`. При изменении состояния выбрасывается событияе `childNodesStateChanged`.

Если узлу задан некоторый набор (свойство `dataSource`), то `childNodesState` синхронизируется с его свойством `state` (в направлении `dataSource.state` -> `childNodesState`).

## Сортировка и группировка

### Сортировка

sorting/sortingDesc/setSorting/emit_sortingChanged

### Группировка

grouping/setGrouping/emit_groupingChangef/GroupingNode/PartitionNode

## disable/enable

disabled/enable/disable/setDisabled/isDisabled/emit_enable/emit_disable/contextDisabled

## selection

selected/selectable/select/unselect/setSelected/setSelection/hasOwnSelection/selection/emit_select/emit_unselect/contextSelection/nullSelection
