# Merge

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
