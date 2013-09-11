# basis.data.Object

Класс `basis.data.Object` ([docs](http://basisjs.com/docs#basis.data.Object)) данные хранятся в виде ключ значение. При этом значения воспринимаются атомарно, вложенность не поддерживается.

Наиболее часто используемый тип данных, является предком для многих классов, в том числе для узлов интерфейса (`basis.ui.Node`). Является простой реализацией хранения данных, без лишней логики. Если требуется нормализация полей, вычисляемые поля, индексы и др., используются классы из пространства имен `basis.entity`.

## Работа с данными

Данные экземпляра хранятся в свойстве `data`. Для обновления данных необходимо пользоваться исключительно методом `update`. В метод передается объект - набор новых значений. Метод `update` сравнивает значения ключей в переданном объекте с имеющимися, и если все значения совпадают – возвращает `false`. Если есть различия, то возвращает дельту, объект, который содержит изменные ключи и их значения до изменения.

Когда меняются значения в `data` – выбрасывается событие `update`. Обработчики события получают параметр `delta` - дельта изменений. С помощью дельты можно определить, что поменялось и восстановить состояние данных до изменений.

```js
basis.require('basis.data');

var example = new basis.data.Object({
  data: {
    name: 'John',
    age: 25
  },
  handler: {
    update: function(sender, delta){
      if ('name' in delta)
        console.log('Name changed:', delta.name, '->', this.data.name);
    }
  }
});

console.log(example.data.name);
// console> 'John'
console.log(example.update({ name: 'John' }));
// console> false
console.log(example.update({ name: 'Ivan' }));
// console> Name changed: John -> Ivan
// console> { name: 'John' }
console.log(example.data.name);
// console> 'Ivan'
console.log(example.update({ age: 30 }));
// console> { age: 25 }
```

## Делегирование

Экземпляры `basis.data.Object` могут связываться, разделяя данные и состояние. Этот процесс называется делегированием. При делегировании связанные экземпляры указывают на один объект данных (их свойства `data` тождественно равны), и имеют одно и то же состояние (их свойства `state` тождественно равны).

Связывание осуществляется методом `setDelegate`. В метод передается новый делегат, это должен быть экземпляр `basis.data.Object` или `null`. Ссылка на делегат, хранится в свойстве `delegate`.

```js
basis.require('basis.data');

var a = new basis.data.Object();
var b = new basis.data.Object();

a.setDelegate(b);

console.log(a.delegate === b);
// > true
console.log(a.data === b.data);
// > true
console.log(a.state === b.state);
// > true

a.update({ prop: 123 });
console.log(a.data.prop);
// > 123
console.log(b.data.prop);
// > 123

b.update({ prop: 456 });
console.log(a.data.prop);
// > 456
console.log(b.data.prop);
// > 456

console.log(String(a.state));
// > 'undefined'
b.setState(basis.data.STATE.PROCESSING);
console.log(String(a.state));
// > 'processing'
console.log(a.state === b.state);
// > true
```

Если меняется делегат, то выбрасывается событие `delegateChanged`. Обработчики события получают параметр `oldDelegate` - значение свойства `delegate` до изменения. Так как при смене делегата меняются ссылки `data` и `state`, то смена делегата часто сопровождается событиями `update` и `stateChanged` (если данные или состояние изменились).

Экземпляр может быть привязан максимум к одному делегату. Но к экземпляру могут быть привязаны через делегирование сколько угодно других объектов. Объекты могут образовывать деревья (граф без циклов). Свойство `root` указывает на корень дерева, когда оно меняется выбрасывается событие `rootChanged`, обработчикам доступен `oldRoot`.

Так как связанные объекты ссылаются на одни и те же данные и имеют общее состояние, не имеет значения, чей метод `update` или `setState` будет вызван - данные и состояние будет изменено у всех объединенных объектов, и для всех объектов будут выброшены соответствующие события.

Чтобы определить связанны ли экземпляры делегированием используется функция `basis.data.isConnected`.

Для получения корневого делегата (корня дерева) используется метод `getRootDelegate`.

Cвойство `cascadeDestroy` опеределяет поведение в случаяе если делегат разрушается. В случае если значение свойства `true`, то экземпляр разрушается вслед за делегатом, в противном случае - удаляется только ссылка на делегат.

```js
var a = new basis.data.Object();
var b = new basis.data.Object({ cascadeDestroy: true });
var c = new basis.data.Object({ delegate: b });

// добавляем объектам обрабочики на событие destroy
a.addHandler({ destroy: function(){ console.log('object `a` destroyed') } });
b.addHandler({ destroy: function(){ console.log('object `b` destroyed') } });
c.addHandler({ destroy: function(){ console.log('object `c` destroyed') } });

console.log(basis.data.isConnected(b, c));
// > true
console.log(c.root === b);
// > true

b.setDelegate(a);
console.log(c.root === a);
// > true

a.destroy();
// > object `b` destroyed
// > object `a` destroyed
```

Свойство `canSetDelegate` определяет можно ли менять свойство `delegate`. То есть значение свойства `true` для этого свойства блокирует смену делегата.

## target

[TODO] isTarget / target / targetChanged

## Инициализация

При создании можно задать свойства `data`, `delegate`, `cascadeDestroy`. Если задано свойство `delegate`, то свойства `data` и `state` игнорируются.

При создании объекта не выбрасываются события `update` и `stateChanged`. Но если задается делегат, то эти события могут быть выброшены.

## listen

[TODO] delegate / target
