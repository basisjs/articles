# Slice

Класс-наследник [`SourceDataset`](../basis.data.dataset.md#sourcedataset), содержит `limit` элементов из источника `source`, отсортированных по правилу `rule`, начиная со смещения `offset`.

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
