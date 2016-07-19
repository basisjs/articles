# basis.Token

<!-- MarkdownTOC -->

- [Работа со значением](#Работа-со-значением)
- [Обработка изменений](#Обработка-изменений)
- [Отложенная обработка изменений](#Отложенная-обработка-изменений)
- [Разрушение токена](#Разрушение-токена)

<!-- /MarkdownTOC -->

`basis.Token` ([docs](http://basisjs.com/docs#basis.Token)) - элементарный класс для хранения значения с возможностью отслеживать его изменение. Его дизайн разработан таким образом, чтобы работать максимально быстро и просто.

От этого класса наследуются классы в других модулях, например, токены локализации `basis.l10n.Token`.

Класс поддерживает механизм [`binding bridge`](bindingbridge.md).

## Работа со значением

Конструктор класса принимает единственный аргумент - начальное значение токена.

Значение токена хранится в свойстве `value`. Для получения значения используется метод `get`, а для установки нового значения - метод `set`.

```js
var token = new basis.Token(123);

console.log(token.get());
// console> 123

console.log(token.set(777));
console.log(token.get());
// console> 777
```

## Обработка изменений

Для того чтобы слушать изменения значения, нужно добавить функцию обработчик (`callback`). Это осуществляется методом `attach`, который принимает два аргумента:

  * fn - функция, которая будет вызвана при изменении значения; этой функции будет передаваться текущее значение токена;

  * context - контекст для функции, необязательный параметр.

В случае повторного вызова метода `attach` с теми же параметрами обработчик будет добавлен еще раз. При этом в `dev` режиме будет выведено предупреждение, так как это, скорее всего, ошибка.

Метод `detach` используется для удаления обработчика. Этому методу нужно передавать те же значения, что и методу `attach`. Если метод `detach` вызван и соответствующий обработчик не найден, то в `dev` режиме будет выведено предупреждение, так как это, скорее всего, ошибка.

```js
var token = new basis.Token(1);
var log = function(value){
  console.log('token value is', value);
};
token.attach(log);

token.set(2);
// сonsole> token value is 2

token.detach(log);

token.set(3);
// функция log вызвана не будет
```

Для инициации вызова обработчика используется метод `apply`. Однако использовать этот метод стоит только во внутренней реализации классов, наследованных от `basis.Token`.

## Отложенная обработка изменений

Если значение меняется очень часто, выгодно вызывать обработчики не сразу, а лишь когда все изменения будут завершены. Для решения этой задачи можно воспользоваться классом `basis.DeferredToken` ([docs](http://basisjs.com/docs#basis.DeferredToken)). Этот класс наследуется от `basis.Token` и его экземпляры ведут себя ровно так же, за тем исключением, что в случае изменения значения обработчики вызываются не сразу, а в следующем фрейме (`nextTick`).

```js
var token = new basis.Token(0);
var deferred = new basis.DeferredToken(0);

var log = function(value){
  console.log('token value is', value);
};
token.attach(log);
deferred.attach(log);

for (var i = 1; i <= 5; i++)
  token.set(i);
// console> value is 1
// console> value is 2
// console> value is 3
// console> value is 4
// console> value is 5

for (var i = 1; i <= 5; i++)
  deferred.set(i);
console.log('demo ends');
// console> demo ends
// console> value is 5
```

Если нужно получить `basis.DeferredToken` от `basis.Token`, можно воспользоваться методом `deferred`. Этот метод возвращает один и тот же `basis.DeferredToken`, созданный при первом вызове. У экземпляров `basis.DeferredToken` метод `deferred` возвращает сам себя.

```js
var token = new basis.Token();
var deferred = token.deferred();

console.log(deferred === token.deferred());
// console> true

var token = new basis.DeferredToken();
console.log(token === token.deferred());
// console> true
```

## Разрушение токена

Несмотря на то, что у токена есть деструктор (метод `destroy`), вызывать его не обязательно. Достаточно убрать все ссылки на экземпляр `basis.Token`/`basis.DeferredToken`, чтобы `garbage collector` смог освободить занимаемую им память.
