# Value

Класс `basis.data.Value` ([docs](http://basisjs.com/docs#basis.data.Value)) и его потомки предназначены для хранения атомарных (не делимых) значений. Даже если значение имеет сложную структуру, например, объект, то изменения в его структуре не отслеживаются, и сам объект воспринимается как единое целое.

От `basis.data.Value` образуются другие классы, например, в пространствах имен `basis.data.value` и `basis.data.index`.

## Работа со значением

Значение хранится в свойстве `value` и может иметь любой тип. Его можно задать при создании объекта или используя метод `set()`. Если значение меняется (для сравнения используется `===`), то метод `set` возвращает `true` и выбрасывается событие `change`. Обработчику события `change` передается предыдущее значение, которое было до изменения.

```js
var Value = require('basis.data').Value;

var value = new Value({
  value: 1,
  handler: {
    change: function(sender, oldValue){  // до 1.0.0 передавались параметры: sender, value, oldValue
      console.log('value changed', oldValue, '->', this.value);
    }
  }
});

value.set(2);
// > value changed 1 -> 2
// value.set(2) вернет true

value.set(2);
// > false
```

У `Value` есть свойство `initValue`, которое хранит значение, назначенное объекту при создании. Метод `reset()` меняет текущее значение на значение свойства `initValue`.

```js
var Value = require('basis.data').Value;

var value = new Value({
  value: 1,
  handler: {
    change: function(sender, oldValue){
      console.log('value changed', oldValue, '->', this.value);
    }
  }
});

value.set(2);
// > value changed 1 -> 2

value.reset();
// > value changed 2 -> 1
```

Когда требуется произвести множество изменений, можно заблокировать объект методом `lock()`. При этом значение будет изменяться, но событий выбрасываться не будет. Это нужно для того, чтобы минимизировать количество событий. Для разблокировки объекта используется метод `unlock()`, при этом сравнивается текущее значение и значение, которое было до блокировки, и если они отличаются - выбрасывается событие `change`.

```js
var Value = require('basis.data').Value;

var value = new Value({
  value: 0,
  handler: {
    change: function(sender, oldValue){
      console.log('value changed', oldValue, '->', this.value);
    }
  }
});

for (var i = 0; i < 3; i++)
  value.set(i + 1);
// > value changed 0 -> 1
// > value changed 1 -> 2
// > value changed 2 -> 3

value.reset();
// > value changed 3 -> 0

value.lock();
for (var i = 0; i < 3; i++)
  value.set(i + 1);
value.unlock();
// > value changed 0 -> 3
```

## Преобразование значений

Одна из частых задач, получение производных значений. Другими словами создание новых экземпляров `Value`, которые хранят результат преобразования некоторой функцией значение другого экземпляра `Value`. При это при изменении оригинального значения или других условий автоматически пересчитывается преобразованное.

Получаемые таким образом объекты являются экземплярами `basis.data.ReadOnlyValue` или его производных, то есть их значение нельзя изменять методом `set()`. Производные значения получают следующими методами:

- `as()` – простое преобразование
- `deferred()` – отложенное значение
- `pipe()` – преобразование `basis.event.Emitter`'а хранимого в качестве значения
- `query()` – подзапрос к значению

### Value#as(fn)

Метод возвращает экземпляр `basis.data.ReadOnlyValue`, который хранит преобразованное значение. Метод принимает единственный параметр – преобразующую функцию.

```js
var Value = require('basis.data').Value;

var example = new Value({
  value: 1
});
var doubleValue = example.as(function(value){
  return value * value;
});

console.log(doubleValue);
// > [object basis.data.ReadOnlyValue]
console.log(doubleValue.value);
// > 1

example.set(2);

console.log(example.value);
// > 2
console.log(doubleValue.value);
// > 4
```

Для одних и тех же значений параметра `fn` возвращается один и тот же токен.

```js
var Value = require('basis.data').Value;

var example = new Value({
  value: 1
});

var double = function(){ .. };
console.log(example.as(double) === example.as(double));
// > true
```

> Рекомендуется чтобы передаваемые функции были чистыми, так как метод `Value#as()` сравнивает функции по их описанию (`Function#toString()`). Если функции замыкают внутри ссылки на внешние переменные, то рекомендуется оборачивать их в `basis.getter()`.

### Value#deferred()

Создает экземпляр `basis.data.DeferredValue`, который содержит то же значение, что и оригинал, но обновляемое в конце текущего кодового фрейма или в следующем (используется `basis.asap.schedule()`).

```js
var Value = require('basis.data').Value;

var foo = new Value({
  value: 1
});
var deferred = foo.deferred();

console.log(foo.value);
// > 1
console.log(deferred.value); // актуальное значение, т.к. только создали значение
// > 1

foo.set(123);
console.log(foo.value);
// > 123
console.log(deferred.value);
// > 1

setTimeout(function(){
  console.log(deferred.value);
  // > 123
}, 10);
```

### Value#pipe(events, fn)

Если оригинальное значение хранит экземпляр `Emitter`, то позволяет слушать у него события и перевычислять производное значение в случае их совершения.

Параметры:

- `events` - события, которые необходимо слушать (список событий в виде строки разделенные пробелом или массив строк)
- `fn` - функция преобразования или строку (пропускается через `basis.getter`)

```js
var DataObject = require('basis.data').Object;
var Value = require('basis.data').Value;

var foo = new DataObject({ data: { prop: 1 } });
var val = new Value({
  value: foo
});
var pipe = val.pipe('update', function(object){
  return object.data.prop;
});

console.log(pipe.value);
// > 1

foo.update({ prop: 333 });
console.log(pipe.value);
// > 333

val.set(new DataObject({ data: { prop: 777 } }));
console.log(pipe.value);
// > 777

val.set();
console.log(pipe.value);
// > undefined
```

### Value#query(path)

Метод–хелпер, для более короткой записи `Value.query()` и отсутсвия необходимости импортировать `Value`.

```js
var Value = require('basis.data').Value;

var val = new Value();

val.query('foo.bar');
// эквивалентно
Value.query(val, 'value.foo.bar');
```

Также см. [`Value.query()`](#valuequerytarget-path)

## Фабрика токенов

Иногда нужно получать преобразование значение экземпляра `Value`, которое также зависит от другого экземпляра `basis.event.Emitter`. Для этого создается функция-фабрика, которая возвращает `basis.data.ReadOnlyValue` для заданого экземпляра `basis.event.Emitter`. Такая функция создается методом `Value#compute()`. Этот метод принимает два аргумента:

  * events - список названий событий (необязательный); список представляется в виде массива строк (названий событий) или строкой, где названия событий разделены пробелом;

  * fn - функция вычисления значения; такая фунция получает два аргумента:

    * object - объект, для которого создан токен;

    * value - текущее значение экземпляра `Value`, от которого образована фабрика токенов.

Значение вычисляется при создании и перевычисляется, когда меняется значение экземпляра `Value` или выбрасывается событие, которое указано в списке событий. В случае разрушения `Value` или объекта разрушается и производные значения.

```js
var Value = require('basis.data').Value;
var DataObject = require('basis.data').Object;

var example = new Value({
  value: 2
});
var sum = example.compute('update', function(object, value){
  return object.data.property * value;
});

var object = new DataObject({
  data: {
    property: 3
  }
});
var token = sum(object);

console.log(token.value);
// > 6

object.update({ property: 10 });
console.log(token.value);
// > 20

example.set(10);
console.log(token.value);
// > 100
```

Фабрики удобно использовать в биндингах `basis.ui.Node`, когда нужно получать значение, которое зависит от некоторого внешнего значения.

```js
var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;

var commission = new Value({ value: 10 });
var list = new Node({
  container: document.body,
  childClass: {
    template: '<div>amount: {amount}, commission: {commission}</div>',
    binding: {
      amount: 'data:amount',
      commission: commission.compute('update', function(node, value){
        return (node.data.amount * value / 100).toFixed(2);
      })
    }
  },
  childNodes: [
    { data: { amount: 12 } },
    { data: { amount: 342 } },
    { data: { amount: 251 } }
  ]
});
// <div>
//   <div>amount: 12, commission: 1.20</div>
//   <div>amount: 342, commission: 34.20</div>
//   <div>amount: 251, commission: 25.10</div>
// </div>

commission.set(15);
// <div>
//   <div>amount: 12, commission: 1.80</div>
//   <div>amount: 342, commission: 51.30</div>
//   <div>amount: 251, commission: 37.65</div>
// </div>
```

## Фабрики

### Value.from(target, [events], fn)

### Value.factory([events], fn)

### Value.state()

### Value.stateFactory()

### Value.query([target], path)
