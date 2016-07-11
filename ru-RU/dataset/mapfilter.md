# MapFilter

Класс-наследник [`SourceDataset`](../basis.data.dataset.md#sourcedataset), задача которого - конвертировать/проецировать элементы источника данных в другие объекты.
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
