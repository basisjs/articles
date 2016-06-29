# basis.data.dataset

Данное пространство имен описывает различные автоматические наборы. Данный вид наборов не управляет своим составом напрямую, а зависит от состава другого набора (или наборов) и некоторых заданных правил.

![Структура классов basis.data.dataset](img/data-datasets.png)

Автоматические наборы можно воспринимать как операции над множествами. Так `basis.data.dataset` экспортирует классы, которые позволяют совершать следующие операции:

  * [Merge](#merge) - объединение нескольких множеств в одно, по правилу (объединение, разность, дополнение и др);

  * [Subtract](#subtract) - вычитание одного множества из другого;

  * [Filter](#filter) - подмножество;

  * [Slice](#slice) - срез;

  * [Split](#split) - разбиение на подмножества 1:1 (группировка);

  * [Cloud](#cloud) - разбиение на подмножества 1:M;

  * [Extract](#extract) - разворачивание;

## Merge

Экземпляры данного класса объединяет составы нескольких наборов по определенному правилу.

Набор источников можно задать при создании, с помощью свойства `sources`, либо менять в дальнешем методами:

  * `addSource(source)` - добавить источник;

  * `removeSource(source)` - удалить источник;

  * `setSources(sources)` - задать новый нобор источников;

  * `clear()` - удалить все источники (очищает набор);

При изменении состава источников выбрасывается событие `sourcesChanged`. Данное событие аналогично `itemsChanged`, только в дельте хранятся добавленные и удаленные источники, а не элементы набора. С версии 1.3 для источников применяется [resolveDataset](basis.data.datasets.md#resolvedataset), для получения ссылок на набор.

Правило (свойство `rule`) определяет, каким образом объединяются наборы. Правило получает два значения: `count` - количество вхождений объекта (в скольких источниках он присутствует), и `sourceCount` - количество источников. По умолчанию определены следующие правила:

  * `UNION` – объединение, есть хотя бы в одном источнике;

  * `INTERSECTION` – пересечение, есть во всех источниках;

  * `DIFFERENCE` – разность, есть только в одном источнике;

  * `MORE_THAN_ONE_INCLUDE` – не уникальное значение, есть в двух и более источниках;

  * `AT_LEAST_ONE_EXCLUDE` – отсутствует хотя бы в одном источнике;

```js
var DataObject = basis.require('basis.data').Object;
var Dataset = basis.require('basis.data').Dataset;
var Merge = basis.require('basis.data.dataset').Merge;

var foo = new DataObject({ data: { name: 'foo' } });
var bar = new DataObject({ data: { name: 'bar' } });
var baz = new DataObject({ data: { name: 'baz' } });

var source1 = new Dataset({ items: [foo, bar] });
var source2 = new Dataset({ items: [foo, baz] });

var merge = new Merge({
  sources: [source1, source2],
  rule: Merge.INTERSECTION
});

console.log(merge.getValues('data.name'));
// > ['foo']
```

## Subtract

Набор, хранящий результат вычитания одного набора из другого.

Уменьшаемое хранится в свойстве `minuend`, его можно задать методом `setMinuend`. Вычитаемое хранится в свойстве `subtrahend`, которое можно менять методом `setSubtrahend`. Оба операнда можно изменить разом используя метод `setOperands`. С версии 1.3 для обоих операндов используется [resolveDataset](basis.data.datasets.md#resolvedataset).

Когда меняется уменьшаемое, выбрасывается событие `minuendChanged`, а при изменении вычитаемого – `subtrahendChanged`. Если один из аперандов не задан, то набор будет пустым.

```js
var Dataset = basis.require('basis.data').Dataset;
var Subtract = basis.require('basis.data.dataset').Subtract;

var data = basis.require('basis.data').wrap([1, 2, 3, 4, 5, 6, 7], true);
var foo = new Dataset({
  items: data.slice(0, 5)  // 1, 2, 3, 4, 5
});
var bar = new Dataset({
  items: data.slice(2, 6)  // 3, 4, 5, 6
});

var subtract = new Subtract({
  minuend: foo,
  subtrahend: bar
});

console.log(subtract.getValues('data.value'));
// > [1, 2]

foo.add(data[6]);
console.log(subtract.getValues('data.value'));
// > [1, 2, 7]

bar.remove(data[2]);
console.log(subtract.getValues('data.value'));
// > [1, 2, 3, 7]
```

## SourceDataset

Инкапсулирует работу с источником данных. Чаще всего не используется напрямую, а, как будет показано ниже, является предком для других автоматических наборов.

Источник данных задается в свойстве `source` при создании набора или методом `setSource` после.
К значению свойства `source` применяется [resolveDataset](basis.data.datasets.md#resolvedataset) для получения ссылок на набор.

При смене источника данных инициируется событие `sourceChanged`, а в качестве аргументов передаются: `sender` (экземпляр `SourceDataset`) и ссылка на старый источник данных.

```javascript
var DataObject = basis.require('basis.data').Object;
var Dataset = basis.require('basis.data').Dataset;
var SourceDataset = basis.require('basis.data.dataset').SourceDataset;
var MyDataset = SourceDataset.subclass();

var foo = new DataObject();
var bar = new DataObject();

var datasource = new Dataset({ items: [foo, bar] });
var datasource2 = new Dataset({ items: [bar] });

var myDataset = new MyDataset({ source: datasource });

myDataset.setSource(datasource2);
```

Так же, `SourceDataset` поддерживает [listen](basis.event.md#listen) для `source`

## Slice

Класс-наследник `SourceDataset`, содержит `limit` элементов из источника `source`, отсортированных по правилу `rule`, начиная со смещения `offset`.

Правило должно возвращать значение, по которому будут сортироваться элементы источника. Правило задается свойством `rule`, а направление сортировки – свойством `orderDesc`. Правило и направление сортировки можно изменить методом `setRule(rule, orderDesc)`. Когда меняется правило выбрасывается событие `ruleChanged`.

Максимальное количество элементов задается свойством `limit`, которое можно изменить методом `setLimit(limit)`. Смещение, или количество элементов которое должно быть пропущено, задается свойством `offset` и меняется методом `setOffset(offset)`. Одновременно поменять оба свойства можно методом `setRange(offset, limit)`. Когда меняется смещение или лимит выбрасывается событие `rangeChanged(oldOffset, oldLimit)`.

```js
var DataObject = basis.require('basis.data').Object;
var Dataset = basis.require('basis.data').Dataset;
var Slice = basis.require('basis.data.dataset').Slice;

var data = basis.require('basis.data').wrap([1, 2, 3, 4, 5], true);
var dataset = new Dataset({
  items: data
});
var top3max = new Slice({
  source: dataset,
  rule: 'data.value',
  orderDesc: true,
  limit: 3
});

console.log(top3max.getValues('data.value'));
// console> [3, 4, 5]

var obj = new DataObject({ data: { value: 123 } });
dataset.add(obj);
console.log(top3max.getValues('data.value'));
// console> [4, 5, 123]

obj.update({ value: 4.5 });
console.log(top3max.getValues('data.value'));
// console> [4, 5, 4.5]
```

## MapFilter

Класс-наследник `SourceDataset`, задача которого - конвертировать/проецировать элементы источника данных в другие объекты.
Одновременно с этим может выполняться фильтрация данных по заданному правилу.

За проецирование данных отвечается функция, которая задается в свойстве `map` при создании набора или методом `setMap` после.
Эта функция вызывается для каждого элемента источника и должна вернуть `basis.data.Object`, который и будет являться проекцией элемента.
В качестве приближенного аналога, можно обратиться к описанию метода [Array#map](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Array/map).

Если функция проекции вернет что-то отличное от `basis.data.Object`, то элемент, для которого вызвана функция, не войдет в итоговый набор данных потому, что наборы могут содержать только экземпляры `basis.data.Object` или его потомков.
Таким образом, функция проекции может выполнять неявную фильтрацию данных:

```js
var DataObject = basis.require('basis.data').Object;
var Dataset = basis.require('basis.data').Dataset;
var MapFilter = basis.require('basis.data.dataset').MapFilter;

var data = basis.require('basis.data').wrap([1, 2, 3, 4], true);
var datasource = new Dataset({
  items: data
});
var mapFilter = new MapFilter({ source: datasource });
console.log(mapFilter.getValues('data.value'));
// > [1, 2, 3, 4]

var delta = mapFilter.setMap(function(item){
  if (item.data.value > 2)
    return new DataObject({ data: { value: item.data.value * 2 } });
});

console.log(delta);
// > { deleted: [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }], inserted: [{ value: 6 }, { value: 8 }] }

console.log(mapFilter.getValues('data.value'));
// > [6, 8]

data[0].update({ value: 100 });
console.log(mapFilter.getValues('data.value'));
// > [6, 8, 100]
```

Как видно из примера, при установке функции проекции (методом `setMap`) проекция всех элементов источника выполняется заново, а при изменении значения одного из элементов источника, происходит перепроверка только измененного элемента.

Список событий, когда должно перевычисляться правило, задается только при создании набора свойством `ruleEvents`.
Значением этого свойства может быть строка (список событий разделенных пробелом) или массив строк. По умолчанию у элементов источника слушается событие `update`.

Если проекция или фильтрация приводит к изменению итогового набора данных, то инициируется событие `itemsChanged`.

Как было сказано выше, функция проекции может выполнять неявную фильтрацию данных, но изначально не предназначена для этого.

Для фильтрации данных, используется функция, которая задается свойством `filter` при создании набора или методом `setFilter` после.

Эта функция будет вызвана для каждого элемента из тех, что вернула функция проекции.
В качестве аргумента функция принимает элемент-проекцию и должна вернуть `false`, если элемент прошел проверку, и `true`, если не прошел:

```js
var DataObject = basis.require('basis.data').Object;
var Dataset = basis.require('basis.data').Dataset;
var MapFilter = basis.require('basis.data.dataset').MapFilter;

var data = basis.require('basis.data').wrap([1, 2, 3, 4], true);
var datasource = new Dataset({
  items: data
});
var mapFilter = new MapFilter({ source: datasource });
console.log(mapFilter.getValues('data.value'));
// > [1, 2, 3, 4]

mapFilter.setMap(function(item){
  return new DataObject({ data: { value: item.data.value * 2 } });
});
console.log(mapFilter.getValues('data.value'));
// > [2, 4, 6, 8]

mapFilter.setFilter(function(item){
  return item.data.value > 6;
});

console.log(mapFilter.getValues('data.value'));
// > [2, 4, 6]
```

Функция фильтрации имеет обратную логику по отношению к [Array#filter](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

Через свойство `rule` можно указать getter для быстрого доступа к необходимому свойству объекта.
Это можно сделать при создании набора или методом `setRule` после:

```js
var DataObject = basis.require('basis.data').Object;
var Dataset = basis.require('basis.data').Dataset;
var MapFilter = basis.require('basis.data.dataset').MapFilter;

var data = basis.require('basis.data').wrap([1, 2, 3, 4], true);
var datasource = new Dataset({
  items: data
});
var mapFilter = new MapFilter({ source: datasource, rule: 'data.value' });
console.log(mapFilter.getValues('data.value'));
// > [1, 2, 3, 4]

mapFilter.setMap(function(item){
  return new DataObject({ data: { value: item.data.value * 2 } });
});
console.log(mapFilter.getValues('data.value'));
// > [2, 4, 6, 8]

mapFilter.setFilter(function(item){
  return this.rule(item) > 6;
});

console.log(mapFilter.getValues('data.value'));
// > [2, 4, 6]
```

По умолчанию `rule` представлен в виде getter'а, который всегда возвращает `true`.

При установке нового правила инициируется событие `ruleChanged`.

## Filter

> До версии 1.3 класс назывался `Subset`.

Класс-наследник `MapFilter`. Экземпляры этого класса добавляют в свой состав только те элементы источника, для которых правило возвращает положительный результат (приводимый к `true`).

По сути, `Filter` отличается от `MapFilter` только переопределением функции фильтрации. У `Filter` она по умолчанию выглядит так:
```js
basis.data.dataset.Filter.prototype.filter = function(item){
  return !this.rule(item);
}
```

Как видно из примера, результат правила (`rule`) будет приведен к `boolean` и обработан функцией фильтрации.
Напомним, что по умолчанию `rule` представлен как getter, который всегда возвращает `true`.

```js
var DataObject = basis.require('basis.data').Object;
var Dataset = basis.require('basis.data').Dataset;
var Filter = basis.require('basis.data.dataset').Filter;

var data = basis.require('basis.data').wrap([1, 2, 3, 4, 5], true);

// создаем набор-источник (нужен для примера)
var dataSource = new Dataset({
  items: data
});

// создаем подмножество
var filter = new Filter({
  source: dataSource,            // задаем источник
  rule: function(item){          // правило
    return item.data.value % 2;  // только нечетные
  }
});

console.log(filter.getValues('data.value'));
// > [1, 3, 5]

data[0].update({ value: 0 });
console.log(filter.getValues('data.value'));
// > [3, 5]

data[1].update({ value: 33 });
console.log(filter.getValues('data.value'));
// > [33, 3, 5]

dataSource.remove([data[0], data[1], data[2]]);
console.log(filter.getValues('data.value'));
// > [5]
```

## Split

`Split` позволяет разделить элементы на подмножества по результату выполнения функции-правила (свойство `rule`). При этом членами набора становятся наборы-группы, по которым распределяются элементы набора-источника (свойство `source`). Каждый элемент может находиться только в одной группе.

Правило задается при создании через свойство `rule`, меняется методом `setRule`.
В качестве значения можно указать функцию или строку – значение пропускается через `basis.getter`.
Функция должна возвращать некоторое значение, которое будет являться ключом группы.
Для сравнения значение приводится к строке, а если значение – экземпляр basis.data.Object, то берется его идентификатор (basisObjectId).
Для каждого нового значения создается новое подмножество – группа, и добавляется в набор.
Если группа становится пустой, то она удаляется из набора.

Группа - это экземпляр класса `basis.data.DatasetWrapper`. Значение, для которого она была создана, хранится в свойстве `ruleValue`. В качестве `dataset` задан набор, который содержит все элементы группы. Если значением группы является экземпляр `basis.data.Object`, то он будет назначен делегатом.

Для получения объекта группы используется метод `getSubset`, которому передается ключ группы. Группа возвращается, только если для значения уже существует группа. Если требуется получить группу и при необходимости создать ее, то вторым параметром передается конфиг для группы или `true`.

Класс для объекта группы определяется свойством `subsetWrapperClass` (по умолчанию `basis.data.DatasetWrapper`), а класс для набора – `subsetClass` (по умолчанию `basis.data.ReadOnlyDataset`). Управляет группами экземпляр класса `basis.object.KeyObjectMap`. Его можно задать при создании набора, указав в свойстве `keyMap` экземпляр `basis.object.KeyObjectMap` или конфиг для него.

Набор слушает изменения в элементах источника и перемещает элемент из одной группы в другую, при необходимости.

```js
var Dataset = basis.require('basis.data').Dataset;
var Split = basis.require('basis.data.dataset').Split;

var data = basis.require('basis.data').wrap([
  { city: 'Moscow', country: 'Russia' },
  { city: 'St. Peterburg', country: 'Russia' },
  { city: 'Orenburg', country: 'Russia' },
  { city: 'Washington', country: 'USA' },
  { city: 'New York', country: 'USA' },
], true);
var cities = new Dataset({
  items: data
});
var splitByCountry = new Split({
  source: cities,
  rule: 'data.country'
});

console.log(splitByCountry.getItems());
// console> [{ ruleValue: 'Russia', .. }, { ruleValue: 'USA', .. }]

console.log(splitByCountry.getSubset('Russia', true).itemCount);
// console> 3

console.log(splitByCountry.getSubset('Russia', true).getValues('data.city'));
// console> [{ data: { city: 'Moscow', .. }, .. }, .. ]

console.log(splitByCountry.getSubset('Unknown'));
// console> undefined
```

## Cloud

`Cloud`, как и `Split`, позволяет разделить элементы на подмножества по результату выполнения функции-правила (свойство `rule`).
Разница заключается в том, как интерпретируется результат применения `rule`.
Ко всем элементам источника данных будет применено правило (`rule`).
Задача правила - сформировать группу элементов связанных с элементом источника данных определенным образом.
Для каждого уникального элемента этих групп, `Cloud` сформирует [KeyObjectMap](basis.data.map.md).
Ключами карты будут являться уникальные элементы групп, сформированных правилом (`rule`).
Значениями карты будут являться [наборы](basis.data.datasets.md), содержащие элементы сформированных групп.

Другими словами: экземпляр `Cloud` содержит карту соответствий исходных элементов и наборов, которые были сформированы из этих элементов.

Рассмотрим пример, в котором найдем такие делители от 2 до 10, которые будут нацело делить числа от 2 до 10:

```js
var Dataset = basis.require('basis.data').Dataset;
var Cloud = basis.require('basis.data.dataset').Cloud;

// массив со значениями 2..10
var numbers = basis.array.create(10, function(idx){
  return idx + 1;
}).slice(1);
var data = basis.require('basis.data').wrap(numbers, true);

var datasource = new Dataset({ items: data });
var cloud = new Cloud({
  source: datasource,
  rule: function(item) {
    // для каждого числа возвращаем список делителей, которые будут делить это число нацело
    return numbers.filter(function(n) {
      return !(item.data.value % n);
    });
  }
});

cloud.getValues(function(item){
  console.log(item.ruleValue, item.getValues('data.value'))
});
// > 2 [2, 4, 6, 8, 10]
// > 3 [3, 6, 9]
// > 4 [4, 8]
// > 5 [5, 10]
// > 6 [6]
// > 7 [7]
// > 8 [8]
// > 9 [9]
// > 10 [10]
```

У каждого элемента набора есть свойство `ruleValue`, содержащее значение, по которому группируются объекты из набора-источника.

Используя метод `getSubset` можно получить интересующее подмножество.
Первым параметром указывается значение группировки, второй (необязательный) определяет нужно ли создавать подмножество, если для указанного значения еще не создано подмножества.

```js
var Dataset = basis.require('basis.data').Dataset;
var Cloud = basis.require('basis.data.dataset').Cloud;

// массив со значениями 2..10
var numbers = basis.array.create(10, function(idx){
  return idx + 1;
}).slice(1);
var data = basis.require('basis.data').wrap(numbers, true);

var datasource = new Dataset({ items: data });
var cloud = new Cloud({
  source: datasource,
  // для каждого числа возвращаем список делителей, которые будут делить это число нацело
  rule: function(item) {
    return numbers.filter(function(n) {
      return !(item.data.value % n);
    });
  }
});

var subset = cloud.getSubset(4);
console.log(subset.ruleValue, subset.getValues('data.value'));
// > 4 [4, 8]
```

Список событий, когда должно перевычисляться правило, задается только при создании набора свойством `ruleEvents`.
Значением этого свойства может быть строка (список событий разделенных пробелом) или массив строк. По умолчанию у элементов источника слушается событие `update`.

Вы так же можете подписаться на изменение содержимого набора конкретного значения:

```js
cloud.getSubset(4).addHandler({ itemsChanged: function(){ .. } });
```

## Extract

`Extract` позволяет рекурсивно извлекать/разворачивать элементы из вложенных наборов, превращая их в плоскую структуру.

Правило извлечения задается при создании через свойство `rule`, меняется методом `setRule`.
При помощи правила можно трансформировать значение в новый набор данных ("развернуть" значение) или указать `basis.getter`.
Если правило возвращает `basis.data.ReadOnlyDataset` (или потомков), то в результат добавляются все его элементы, при этом к каждому новому элементу (если он еще не встречался ранее) вновь применяется `rule`.
Изменения в таком наборе отслеживаются автоматически.

```js
var Dataset = basis.require('basis.data').Dataset;
var Filter = basis.require('basis.data.dataset').Filter;
var Extract = basis.require('basis.data.dataset').Extract;
var wrap = basis.require('basis.data').wrap;
var adminUsers = new Dataset({ items: wrap([{ name: 'Admin User 1' }, { name: 'Admin User 2' }], true) })
var contentUsers = new Dataset({ items: wrap([{ name: 'Content User 1' }, { name: 'Content User 2' }], true) })

var groups = new Dataset({
  items: wrap([
    { id: 'admin', users: adminUsers },
    { id: 'content', users: contentUsers },
  ], true)
});

var extract = new Filter({
  source: new Extract({
    source: groups,
    rule: 'data.users'
  }),
  rule: 'data.name'
});

console.log(extract.getValues('data.name'));
// > ["Admin User 1", "Admin User 2", "Content User 1", "Content User 2"]

adminUsers.add(wrap([{ name: 'Admin User 3' }], true));
console.log(extract.getValues('data.name'));
// > ["Admin User 1", "Admin User 2", "Content User 1", "Content User 2", "Admin User 3"]
```

В данном случае, `Extract` используется в паре с `Filter` для того, чтобы отбросить `группы` и оставить только `пользователей`.
