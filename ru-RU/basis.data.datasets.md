# Наборы

Набор (dataset) – *неупорядоченное множество* объектов данных (экземпляров `basis.data.Object` и его потомков). Так как набор является множеством, то каждый объект в наборе присутствует в единственном экземпляре. Набор отвечает на вопрос, входит ли некоторый объект в его состав или нет.

Базовым классом этой группы классов является `basis.data.ReadOnlyDataset`.

> До версии 1.3 этот класс назывался `AbstractDataset`.

Наборы бывают двух типов: пользовательские, имеющие интерфейс для изменения состава, и автоматические, состав которых определяется некоторым правилом.

Основные классы наборов описаны в пространстве имен `basis.data`, дополнительные в [`basis.data.dataset`](basis.data.dataset.md) (большая часть [автоматических наборов](basis.data.dataset.md)), `basis.data.index` и других.

## ReadOnlyDataset

`ReadOnlyDataset` наследуется от `basis.data.AbstactData` и является базовым классом для наборов. Экземпляры класса хранят информацию о вхождении в них объектов, но не имеют интерфейса для модификации этой информации.

Различные классы наборов хранят элементы в виде хеш-таблиц (карт) или более сложных структур, поэтому для получения списка всех элементов набора в виде массива используется универсальный метод `getItems()`. Узнать количество элементов можно с помощью свойства `itemCount`.

```js
console.log(dataset.getItems());
// console> [object, object, object]

console.log(dataset.itemCount);
// console> 3
```

> Для улучшения производительности, метод `getItems()` кеширует результат выполнения, до тех пор, пока набор не будет изменен или разрушен. Таким образом, при повторном вызове возвращается тот же массив. По этой причине, массив, возвращаемый этим метод, нельзя менять. В целом, стоит избегать использования `getItems()`, и обычно в его использовании нет необходимости.

Метод `getValues()` позволяет получить список значений, полученных от каждого элемента набора. В качестве параметра методу передается функция-геттер или строка, из которой может быть получена такая функция (используется `basis.getter()`).

```js
dataset.getValues(function(item){
  return item.data.value;
});

// или

dataset.getValues('data.value');

// обе записи эквивалентны

dataset.getItems().map(function(item){
  return item.data.value;
});
```

> Результат выполнения `getValues()` не кешируется и может использовать как угодно.

Чтобы получить произвольный элемент набора используется метод `pick()`, а для получения `N` (максимум) произвольных элементов – метод `top()`.

```js
console.log(dataset.pick());
// console> object

console.log(dataset.top(2));
// console> [object, object]
```

Чтобы узнать, входит ли объект в состав набора, используется метод `has()`.

```js
console.log(dataset.has(dataset.pick()));
// console> true
```

Метод `forEach` позволяет выполнить некоторую функцию для каждого элемента набора.

```js
dataset.forEach(function(item){
  console.log(item);
});

// эквивалентно

dataset.getItems().forEach(function(item){
  console.log(item);
});
```

Когда меняется состав набора, выбрасывается событие `itemsChanged`. Обработчики получают параметр `delta` - изменения в наборе. Если добавлены новые элементы, то дельта содержит свойство `inserted`, массив с новыми объектами, а если некоторые элементы удалены – свойство `deleted`, массив с удаленными объектами.

```js
dataset.addHandler({
  itemsChanged: function(dataset, delta){
    if (delta.inserted)
      for (var i = 0, item; item = delta.inserted[i]; i++)
        console.log('item added', item);

    if (delta.deleted)
      for (var i = 0, item; item = delta.deleted[i]; i++)
        console.log('item removed', item);
  }
});
```

## Dataset

Класс `Dataset` наследуется от `ReadOnlyDataset` и предназначен для создания наборов, составом которых можно управлять.

Этот класс предоставляет следующие методы:

  * `add(items)` - добавление элементов;

  * `remove(items)` - удаление элементов;

  * `set(items)` - задание списка элементов;

  * `sync(items)` - синхронизация (см. подробнее ниже);

  * `clear()` - очистка (удаление всех элементов);

Методам `add()`, `remove()`, `set()` и `sync()` передается массив элементов. Методам `add()` и `remove()` можно передавать одиночный объект. При выполнении методов игнорируются дубликаты и значения, которые не являются экземплярами `basis.data.Object`.

В ходе выполнения методов составляется дельта изменений: какие элементы удалены и какие добавлены. Если дельта не пустая (хотя бы один элемент добавился или удалился), то выбрасывается событие `itemsChanged`.

```js
var Dataset = basis.require('basis.data').Dataset;

var dataset = new Dataset();

dataset.add([object1, object2]);
// console> { inserted: [object1, object2] }
// если необходимо добавить один элемент, не обязательно передавать массив
dataset.add(object3);
// console> { inserted: [object3] }

dataset.remove([object3, object1]);
// console> { deleted: [object3, object1] }
// если необходимо удали один элемент, не обязательно передавать массив
dataset.remove(object2);
// console> { deleted: [object2] }

dataset.set([object1, object3]);
// console> { inserted: [object1, object3] }
dataset.set([object3, object2]);
// console> { inserted: [object2], deleted: [object1] }
```

Процесс синхронизации (метод `setAndDestroyRemoved()`) подразумевает сравнение текущего набора с переданным списком элементом. В случае удаления элемента из набора, он разрушается (вызывается его метод `destroy`).

Синхронизация работает следующим образом. Пусть текущий список элементов это `A`, а переданный список – `B`. Если элемент присутствует в обоих списках, то никаких действий с ним не производится. Если элемент есть только в `A`, но отсутствует в `B`, то элемент разрушается (вызывается его метод `destroy`). Если элемента нет в списке `A`, но он есть в `B`, то он добавляется в набор.

```js
var DataObject = basis.require('basis.data').Object;
var Dataset = basis.require('basis.data').Dataset;

var DemoObject = DataObject.subclass({
  destroy: function(){
    console.log(this.name + ' destroy');
  }
});
var object1 = new DemoObject({ name: 'object1' });
var object2 = new DemoObject({ name: 'object2' });
var object3 = new DemoObject({ name: 'object3' });
var dataset = new Dataset();

dataset.set([object1, object2]);

dataset.setAndDestroyRemoved([object2, object3]);
// console> object1 destroy
// console> [object3]
```

Можно задать состав набора при его создании, используя свойство `items`. В дальнейшем это свойство никак не используется и равно `null`.

```js
var Dataset = require('basis.data').Dataset;

var dataset = new Dataset({
  items: [
    ...
  ]
});
```

Если элемент набора разрушается (вызывается его метод `destroy()`), он автоматически удаляется из набора.

## resolveDataset

Многие классы позволяют подключать наборы. Нередко ссылка на набор хранится как свойство некоторого объекта, то есть набор может задаваться в качестве значения для определенных свойств. Когда для таких свойств задается значение, то оно передается функции `resolveDataset()`. И в свойстве сохраняется результат выполнения этой функции. Как вычисляется этот результат? Функция `resolveDataset()` пытается получить ссылку на набор из переданного значения (способ получения зависит от его типа). Далее, в случае необходимости, функция отслеживает изменения в значении, обновляя ссылку. В последнем случае создается специальный объект – адаптер, который хранит информацию о связи.

Функция принимает 4 параметра:
- `context` – объект, которому привязывается набор;
- `fn` – функция, выполняемая при изменении ссылки на набор;
- `source` – значение, из которого нужно получить ссылку на набор;
- `property` – свойство для хранения ссылки на адаптер.

Значение разрешается следующим образом. Если значение является функцией, то она вызывается (с контекстом `context`), а результат используется для разрешения ссылки на набор. Если значение – экземпляр класса `basis.data.DatasetWrapper`, то берется значение из свойства `dataset` и отслеживается его изменение (слушается событие `datasetChanged`). Иначе, если значение – экземпляр класса `basis.data.Value`, то используется значение из свойства `value` и отслеживается его изменение (слушается событие `change`). Так же разрешаются объекты с интерфейсом `bindingBridge` (например, `basis.Token`). Значения экземпляров `basis.data.Value` и `bindingBridge`-объектов разрешаются с помощью `resolveDataset` рекурсивно. Если итоговое значение является экземпляром `ReadOnlyDataset`, то оно и возвращается, иначе возвращается `null`.

Таким образом поддерживаются следующие значения для получаения ссылки на набор:
- функция
- `basis.data.DatasetWrapper`
- `basis.data.Value`
- объект с `bindingBridge` (например, `basis.Token`)
- `basis.data.ReadOnlyDataset`

Обычно функция не используется самостоятельно, но ее используют различные методы. Например, `basis.data.DatasetWrapper#setDataset` или `basis.ui.Node#setDataSource`.

Так можно хранить ссылку на набор, например, в экземпляре `basis.data.Value`:

```js
var Node = basis.require('basis.ui').Node;
var Value = basis.require('basis.data').Value;

var currentSet = new Value();
var node = new Node({
  dataSource: currentSet
});

console.log(node.dataSource);
// console> null
// node.dataSourceAdapter_ - адаптер для currentSet
// node.dataSourceAdapter_.source === currentSet

currentSet.set(exampleDataset);
console.log(node.dataSource === exampleDataset);
// console> true
```

А вот так можно автоматизировать установку `dataSource` из одного из полей свойства `data`.

```js
var Node = basis.require('basis.ui').Node;
var Value = basis.require('basis.data').Value;
var Dataset = basis.require('basis.data').Dataset;

var node = new Node({
  dataSource: Value.factory('update', 'data.items'), // эквивалентно Value.query('data.items')
  data: {
    items: new Dataset()
  }
});

console.log(node.dataSource === node.data.items);
// console> true

console.log(node.dataSource);
// console> basis.data.Dataset {}

node.update({ items: null });
console.log(node.dataSource);
// console> null
```
