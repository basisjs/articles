# basis.type

> До basis.js 1.10 функциональность `defineType()` и `getTypeByName()` была определена в модуле `basis.entity`.

## Преобразование basis.type

Готовое преобразование `basis.type` - чистая функция, которая принимает на вход два аргумента: новое и старое значение.

```js
function(newValue, oldValue) {
    // ...
}
```

Стандартная логика подобного преобразования следующая:
- попытаться привести новое значение к корректному значению
- если его привести не удается - вывести ворнинг и вернуть старое значение

Преобразование `basis.type` получит в качестве `newValue` константу `basis.type.DEFAULT_VALUE` в момент инициализации типа.

## Стандартные преобразования

- type.string
- type.number
- type.int
- type.enum
- type.array
- type.object
- type.date

По умолчанию преобразования работают по следующей логике:
- попробовать привести значение к корректному значению
- если привести значение не удалось - вернуть старое значение
- в момент инициализации - возвращается значение по умолчанию

Название типа | Корректный ввод | Преобразование | Значение по умолчанию
--------------|-----------------|----------------|----------------------
string | строка | _ | ""
string.nullable | строка или null | _ | null
string.default(value) | строка | _ | value
string.nullable.default(value) | строка или null | _ | value
int | !isNaN(\_) && isNaN != null | parseInt(_, 10) | 0
int.nullable | !isNaN(\_) | parseInt(_, 10) | null
int.default(value) | !isNaN(\_) && isNaN != null | parseInt(_, 10) | value
int.nullable.default(value) | !isNaN(\_) | parseInt(_, 10) | value
number | !isNaN(\_) && isNaN != null | Number(_) | 0
number.nullable | !isNaN(\_) | Number(_) | null
number.default(value) | !isNaN(\_) && isNaN != null | Number(_) | value
number.nullable.default(value) | !isNaN(\_) | Number(_) | value
enum(arr) | элемент arr | _ | arr[0]
enum(arr).nullable | элемент arr, null | _ | null
enum(arr).default(arrItem) | элемент arr | _ | arrItem
enum(arr).nullable.default(arrItem) | элемент arr, null | _ | arrItem
set(arr) | элемент arr, массив элементов из arr | Array.isArray(\_) ? _ : [_] | []
set(arr).default(defArr) | элемент arr, массив элементов из arr | Array.isArray(\_) ? _ : [_] | defArr
array | массив, null | _ | null
array.default(value) | массив, null | _ | value
object | typeof _ == "object" | _ | null
object.default(value) | typeof _ == "object" | _ | value
date | объект Date, ISO-строка, null | \_, fromISOString(_) | null
date.default(value) | объект Date, ISO-строка, null | \_, fromISOString(_) | value

Некоторые типы имеют свойство `.nullable`, содержащее преобразование, которое в случае передачи `null` в качестве `newValue` возвращает `null`, в остальных случаях ведет себя как исходный тип.
Метод `.default(defaultValue)`, возвращает преобразование, которое в момент инициализации возвращает `defaultValue`, в остальном ведет себя как модифицируемый тип.

## type.array

В случае передачи массива функции type.array, производится поверхностное сравнение. В случае равенства элементов массивов возвращается старое значение

## Интерфейс типа

Интерфейс типа сейчас повсеместно используется при описании `Entity`. Он может содержать одно из следующих значений:
- преобразование
- название именованного типа, который был задан методом defineType

### defineType()

`defineType(typeName, type)` регистрирует тип с заданным именем. После этого можно получить тип через `.getTypeByName()`

### getTypeByName()

`getTypeByName` возвращает преобразование по его названию, заданному defineType:

```js
defineType('MyType', type.string);
getTypeByName('MyType'); // -> type.string
```

Допускается также отложенная инициализация:

```js
var DeferredType = getTypeByName('DeferredType'); // function(oldValue, newValue) { ... }
DeferredType('234.55'); // undefined + warning

defineType('DeferredType', type.int);
DeferredType('234.55'); // 234
```

Помимо этого, `getTypeByName` можно передать два дополнительных параметра `typeHost` и `typeField` для позднего связывания типа:

```js
var obj = {};

var DeferredType = getTypeByName('DeferredType', obj, 'fieldOfDeferredType'); 
obj.fieldOfDeferredType // undefined

defineType('DeferredType', type.int);
obj.fieldOfDeferredType == type.int // true
```

### validate()

`basis.type.validate([fatal = false])` выбрасывает предупреждение либо исключение в случае `fatal` равным `true`, если какой-либо из типов, полученных через `getTypeByName` не был разрешен при помощи `defineType`:

```js
var obj = {};

var DeferredType = getTypeByName('DeferredType', obj, 'fieldOfDeferredType');
validate(); // warning - DeferredType was not matched

defineType('DeferredType', type.string);
validate(); // OK
```

```js
var SomeOtherType = getTypeByName('SomeOtherType');
validate(true); // warning - SomeOtherType was not matched

defineType('SomeOtherType', function() {});
validate(true); // OK
```

## Крайние случаи

- передача в `defineType` не функции - выбросить предупреждение и игнорировать
- передача в `defineType` в качестве имени не строку - выбросить предупреждение и игнорировать
- повторный `defineType` - игнорирование и предупреждение
- `.getTypeByName(nonString)` - выбросить предупреждение
- `.enum([])` - выбросить исключение
- `.enum([1,2,3]).default(4)` - игнорировать `default` и выбросить предупреждение

Несуществующие свойства:
- string.nullable.nullable
- string.default(defaultValue).nullable
- string.default(defaultValue).default(defaultValue)
- date.nullable
- string.id.id

