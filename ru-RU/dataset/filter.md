# Filter

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
