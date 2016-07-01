# Split

`Split` позволяет разделить элементы на подмножества по результату выполнения функции-правила (свойство `rule`). При этом членами набора становятся наборы-группы, по которым распределяются элементы набора-источника (свойство `source`). Каждый элемент может находиться только в одной группе.

Правило задается при создании через свойство `rule`, меняется методом `setRule`.
В качестве значения можно указать функцию или строку – значение пропускается через `basis.getter`.
Функция должна возвращать некоторое значение, которое будет являться ключом группы.
Для сравнения значение приводится к строке, а если значение – экземпляр `basis.data.Object`, то берется его идентификатор (`basisObjectId`).
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
