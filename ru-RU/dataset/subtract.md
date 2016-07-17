# Subtract

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
