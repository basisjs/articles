# Value

Класс `basis.data.Value` ([docs](http://basisjs.com/docs#basis.data.Value)) и его потомки предназначены для хранения атомарных (не делимых) значений. Даже если значение имеет сложную структуру, например, объект, то изменения в его структуре не отслеживаются, и сам объект воспринимается как единое целое.

От `basis.data.Value` образуются другие полезные классы, которые описываются в пространствах имен `basis.data.value` и `basis.data.index`.

## Работа со значением

Значение хранится в свойстве `value` и может иметь любой тип. Его можно задать при создании объекта или используя метод `set`. Если значение меняется (для сравнения используется `===`), то метод `set` возвращает `true` и выбрасывается событие `change`. Обработчику события `change` передается предыдущее значение, которое было до изменения.

> У события `change` до версии `0.10.0` была другая сигнатура, а именно вторым параметром (перед oldValue) передавалось текущее значение объекта. Это не имело смысла, так как это значение доступно в свойстве `value` и было убрано в `0.10.0`.

```js
var value = new basis.data.Value({
  value: 1,
  handler: {
    change: function(sender, oldValue){  // до 0.10.0 передавались параметры: sender, value, oldValue
      console.log('value changed', oldValue, '->', this.value);
    }
  }
});

value.set(2);
// console> value changed 1 -> 2
// console> true

value.set(2);
// console> false
```

У `Value` есть свойство `initValue`, которое хранит значение, назначенное объекту при создании. Метод `reset` меняет текущее значение на значение свойства `initValue`.

```js
var value = new basis.data.Value({
  value: 1,
  handler: {
    change: function(sender, oldValue){
      console.log('value changed', oldValue, '->', this.value);
    }
  }
});

value.set(2);
// console> value changed 1 -> 2

value.reset();
// console> value changed 2 -> 1
```

Когда требуется произвести множество изменений, можно заблокировать объект методом `lock`. При этом значение будет изменяться, но событий выбрасываться не будет. Это нужно для того, чтобы минимизировать количество событий. Для разблокировки объекта используется метод `unlock`, при этом сравнивается текущее значение и значение, которое было до блокировки, и если они отличаются - выбрасывается событие `change`.

```js
var value = new basis.data.Value({
  value: 0,
  handler: {
    change: function(sender, oldValue){
      console.log('value changed', oldValue, '->', this.value);
    }
  }
});

for (var i = 0; i < 3; i++)
  value.set(i + 1);
// console> value changed 0 -> 1
// console> value changed 1 -> 2
// console> value changed 2 -> 3

value.reset();
// console> value changed 3 -> 0

value.lock();
for (var i = 0; i < 3; i++)
  value.set(i + 1);
value.unlock();
// console> value changed 0 -> 3
```

## Преобразование значений

Часто нужно не текущее значение экземпляра `Value`, а преобразованное по некоторому правилу, с возможностью отслеживать эти изменения. Для этого используются методы `as` и `deferred`

Метод `as` возвращает экземпляр `basis.Token` или `basis.DeferredToken`, в зависимости от параметров, который хранит преобразованное значение. Метод принимает два параметра:

  * fn - преобразующая функция, результат которой задается токену

  * deferred - булево значение:
    * false - метод вернет экземпляр `basis.Token`
    * true - метод вернет экземпляр `basis.DeferredToken`

```js
var example = new basis.data.Value({
  value: 1
});
var doubleValue = example.as(function(value){
  return value * value;
});

console.log(doubleValue);
// console> [object basis.Token]
console.log(doubleValue.value);
// console> 1

example.set(2);

console.log(example.value);
// console> 2
console.log(doubleValue.value);
// console> 4
```

Для одних и тех же значений параметров `fn` и `deferred` возвращается один и тот же токен.

```js
var example = new basis.data.Value({
  value: 1
});

var double = function(){ .. };
console.log(example.as(double) === example.as(double));
console.log(example.as(double, true) === example.as(double, true));
```

Метод `deferred` работает так же как и метод `as`, но принимает только один аргумент `fn` и всегда возвращает экземпляр `basis.DeferredToken`.

```js
console.log(example.deferred(double) === example.as(double, true));
```

## Фабрика токенов

Иногда нужно получать преобразование значение экземпляра `Value`, которое так же зависит от другого экземпляра `basis.event.Emitter`. Для этого создается фабрика токенов - функция, которая возвращает `basis.Token` для заданого экземпляра `basis.event.Emitter`. Такая функция создается методом `compute`. Этот метод принимает два аргумента:

  * events - список названий событий, который может быть опущен; список представляется в виде массива строк (названий событий) или строкой, где названия событий разделены пробелом;

  * fn - функция вычисления значения; такая фунция получает два аргумента:

    * object - объект, для которого создан токен;

    * value - текущее значение экземпляра `Value`, от которого образована фабрика токенов.

Значение для токена вычисляется при его создании и перевычисляется когда меняется значение у экземпляра `Value` или выбрасывается событие, которое указано в списке событий. В случае разрушения `Value` или объекта, разрушается и токен.

```js
var example = new basis.data.Value({
  value: 2
});
var sum = example.compute('update', function(object, value){
  return object.data.property * value;
});

var object = new basis.data.Object({
  data: {
    property: 3
  }
});
var token = sum(object);

console.log(token.value);
// console> 6

object.update({ property: 10 });
console.log(token.value);
// console> 20

example.set(10);
console.log(token.value);
// console> 20
```

Фабрики удобно использовать в биндингах `basis.ui.Node`, когда нужно получать значение, которое зависит от некоторого внешнего значения.

```js
var commission = new basis.data.Value({ value: 10 });
var list = new basis.ui.Node({
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
