# basis.event

Модуль `basis.event` вводит событийную модель. В основе реализации лежит паттерн [observer](http://en.wikipedia.org/wiki/Observer_pattern).

`basis.event` предоставляет единственный класс Emitter и вспомогательные функции.

## basis.event.Emitter

`Emitter` ([docs](http://www.w1.ru/basis/svn/docs/#basis.event.Emitter)) является предком для большинства классов basisjs. 

Инициация события осуществляется вызовом специального метода. Такие методы принято называть с префиксом `emit_`, а функция метода создается с помощью функции `basis.event.create`. (см. Событийные методы)

```js
var Example = basis.event.Emmiter.subclass({
  emit_myEvent: basis.event.create('myEvent') // создание события myEvent
});
var foo = new Example();
foo.emit_myEvent(); // инициация события
```

### Обработка событий

Для того, чтобы совершать некоторые действия при возникновении события, объекту добавляются обработчики событий. Обработчик - это `plain object`, где ключ - название события, а значение - функция, которая должна быть вызвана, когда это событие наступит. Обработчики добавляются методом `Emitter#addHandler`, при этом так же можно указать контекст выполнения для функций обработчика. Если контекст не задан, то контекстом будет объект, чей метод `Emitter#addHandler` был вызван.

Повторный вызов `Emitter#addHandler` с теми же самыми аргументами приведет к выводу предупреждения в консоли, так как это скорей всего ошибка. Количество добавляемых экземпляру обработчиков не ограничивается.

```js
var Example = basis.event.Emitter.subclass({
  emit_testEvent: basis.event.create('testEvent'),
  emit_eventWithArgs: basis.event.create('eventWithArgs', 'a', 'b')
});
var foo = new Example({ name: 'foo' });
var bar = new Example({ name: 'bar' });

foo.addHandler({
  testEvent: function(){        // testEvent - название события
    // sender -> foo
    // this -> foo
    console.log('testEvent: event context is', this.name);
  }
});                             // контекст не указан

foo.addHandler({
  testEvent: function(){
    // sender -> foo
    // this -> bar
    console.log('testEvent: event context is', this.name);
  },
  eventWithArgs: function(sender, a, b){
    // sender -> foo
    // this -> bar
    console.log('eventWithArgs:', a, b);
  }
}, bar);                        // устанавливаем в качестве контекста bar

foo.emit_testEvent();
// console> testEvent: event context is bar
// console> testEvent: event context is foo

foo.emit_eventWithArgs(1, 2);
// console> sum event in bar context, result: 3
```

Удаляются обработчики методом `Emitter#removeHandler`. При вызове `Emitter#removeHandler` нужно передать те же значения, что и при вызове метода `Emitter#addHandler`.

```js
// НЕПРАВИЛЬНО
// метод removeHandler не удалит обработчик, так как первые аргументы
// в вызовах foo.addHandler и foo.removeHandler - это два разных объекта
foo.addHandler({
  testEvent: function(){
    console.log('testEvent fired');
  }
}, bar);
...
foo.removeHandler({
  testEvent: function(){
    console.log('testEvent fired');
  }
}, bar);

// ПРАВИЛЬНО
var FOO_HANDLER = {
  testEvent: function(){
    console.log('testEvent fired');
  }
};

foo.addHandler(FOO_HANDLER, bar);
...
foo.removeHandler(FOO_HANDLER, bar);
```

Порядок выполнения добавленных обработчиков может быть произвольным, программная логика не должна зависеть от этого порядка. Прекратить выполнение обработчиков события нельзя. Обработчики не должны влиять друг на друга, т.е. не должны знать друг о друге.

### Обработчик по умолчанию

Обработчик можно назначить при создании экземпляра `Emitter` (или его наследников).

```js
var foo = new basis.event.Emitter({
  handler: {                       // обработчик, контекстом будет сам экземпляр
    event1: function(){ .. },
    event2: function(){ .. }
  }
});
```

Если нужно задать контекст для функций обработчика отличный от создаваемого экземпляра, нужно воспользоваться следующей конструкцией.

```js
var foo = new basis.event.Emitter({
  handler: {
    context: bar,
    callbacks: {                   // обработчик
      event1: function(){ .. },
      event2: function(){ .. }
    }
  }
});
```

В текущей реализации не рекомендуется задавать обработчик по умолчанию для классов производных от `Emitter` (в их прототипе). Это усложняет наследование от таких классов и может сломать поведение экземпляра, если в обработчике присутствует некоторая логика.

```js
var ClassA = basis.event.Emitter({
  emit_event: basis.event.create('event'),
  eventCount: 0,
  handler: {
    event: function(sender){
      this.eventCount++;
    }
  }
});

var ClassB = ClassA.subclass({
  handler: {  // свойство переопределено, счетчик eventCount не будет изменяться
    ...
  }
});

var ClassC = ClassA.subclass({
  handler: {
    event: function(){
      ClassA.prototype.handler.event.apply(this, agruments);
      ...
    },
    ...
  }
});
```

В данном случае, вместо назначения `handler` будет лучше определить логику в методе `emit_event`.

### Событийные методы

// Название события может быть любым.
// 
// > Единственное исключение - имя события не должно быть `*`.
// 
// Функции для событий методов создаются функцией `basis.event.create`.

[TODO]

В случае если для экземпляров класса требуется определить некоторую логику, которая должна выполняться при наступлении события, можно переопредить необходимый `emit_` метод.

```js
var Example = basis.data.Object.subclass({
  emit_update: function(delta){
    // действия до обработки обработчиков

    basis.data.Object.prototype.emit_update.call(this, delta);

    // действия после обработки обработчиков
  }
});
```

Если нужно добавить логику добавляемому событийному методу, то можно воспользоваться слудующей техникой:

```js
var Example = basis.event.Emitter.subclass({
  emit_myEvent: basis.event.create('myEvent', 'arg') && function(arg){
    // действия до обработки обработчиков

    basis.event.events.myEvent.call(this, arg);

    // действия после обработки обработчиков
  }
});
```

### destroy

`Emitter` определяет единственное событие `destroy`, которое выбрасывается при разрушении экземпляра (вызов метода `destroy`).

При переопределении `destroy` метода, рекомендуется вызвать переопределенный метод как можно раньше, чтобы событие `destroy` было выброшено и объекты, ссылающиеся на разрушаемый объект, смогли успешно обработать ситуацию (убрать ссылки).

### listen

[TODO]

### Отладка

В `dev` режиме доступно свойство `emit_debug`. Данное свойство можно задать как для экземпляра, так и для любого класса (наследника `Emitter`). Если этому свойству присвоена функция, то эта функция будет вызываться на любое событие после обработки всех обработчиков. Такая функция получает единственный аргумент - объект, который содержит поля:

* type - название события
* serder - инициатор события (чей emit_* метод был вызван)
* args - аргументы с которыми было инициировано событие

```js
basis.data.Object.prototype.emit_debug = function(event){
  console.log(event.type, event.sender, event.args);
};

var foo = new basis.data.Object();
foo.update({ value: 123 });
// console> 'update' [object basis.data.Object] { value: undefined }
```

Так как обработчики хранятся списков, то не удобно просматривать полный список добавленых обработчиков. Для просмотра списка обработчиков в виде массива можно воспользоваться методом `Emitter#handler_list`. Этот метод доступен только в `dev` режиме.