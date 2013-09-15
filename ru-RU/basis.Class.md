# basis.Class (классы)

Функция `basis.Class` и ее методы упрощают процесс конструирования классов. Наследование базируется на прототипном наследовании javascript.

## Создание классов

Классы в создаются с помощью функции `basis.Class`, или ее алиаса `basis.Class.create`. Функция принимает произвольное количество аргументов: первый — это класс, от которого наследуется новый класс, второй и последующие — расширения создаваемого класса. Если новый класс не наследуется от другого класса, то в качестве первого параметра передается `null`.

```js
// класс 
var Foo = basis.Class(null, {
  name: 'default'
});

// класс Bar наследуется от Foo
var Bar = basis.Class(Foo, {
  property: 1,
  method: function(){
    // ...
  }
});
```

[TODO] className

Так же у классов есть метод `subclass`, который может служить альтернативой `basis.Class`. Следующие две записи эквивалентны:

```
var MyClass = basis.Class(SomeClass,  { .. });
var MyClass = SomeClass.subclass({ .. });
```

## Свойства класса

* __extend__
* className
* extend
* extendConstructor
* isSubclassOf
* subclass
* basisClassId_
* superClass_

## Наследование

Любое свойство может быть переопределено в новом классе. Доступ к свойствам супер-класса производится через свойство `prototype` супер-класса.

```js
var Human = basis.Class(null, {
  name: 'no name',
  init: function(name){
    this.name = name;
  },
  say: function(){
    return 'My name is {0}.'.format(this.name);
  }
});

var Gamer = basis.Class(Human, {
  level: 0,
  init: function(name, level){
    Human.prototype.init.call(this, name);
    this.level = level;
  },
  say: function(){
    return Human.prototype.say.call(this) +
      ' I\'m {0} level.'.format(this.level);
  }
});

var john = new Human('John');
var mario = new Gamer('Super Mario', 99);

console.log('John says:', john.say());
// console> My name is John.
console.log('Mario says:', mario.say());
// console> My name is Super Mario. I'm 99 level.
console.log(mario instanceof Human);
// console> true
console.log(mario instanceof Gamer);
// console> true
```

## Жизненый цикл экземпляра

При создании экземпляра класса вызывается конструктор, метод `init`. В этом методе присваиваются начальные значения свойств и выполняются действия, необходимые при создании объекта данного класса.

В `basisjs` все объекты разрушаемы. Когда экземпляр становится не нужен, вызывается его деструктор — метод destroy. В этом методе описываются действия, которые необходимы при разрушении объекта: обычно это разрушение вспомогательных объектов и обнуление ссылок на другие объекты.

[TODO] basisObjectId

## Паттерны создания экземпляров

В базовом варианте классы созданные с помощью `basis.Create` практически ничем не отличаются от классов созданных стандартным путем (с помощью обычной функции), кроме вызова метода `init` при создании экземпляра.

Но часто бывает, что у класса может быть много свойств, которые необходимо задавать при создании экземпляра. В этом случае удобно использовать паттерн авто-расширения экземпляра при создании. Его суть состоит в том, что при создании экземпляра передается единственный параметр — объект `config`. Перед тем как будет вызван метод `init`, все свойства из `config` копируются в экземпляр.

Свойство класса `extendConstructor_` определяет какой паттерн будет использоваться при создании экземпляров. Оно задается при создании класса. Если свойство не задано, его значение наследуется от родительского класса. Если оно `true`, то используется паттерн авто-расширения экземпляра.

```js
// простой класс, похожий на те, что создаются обычными средствами
var SimpleClass = basis.Class(null, {
  name: 'no name',
  init: function(name){
    this.name = name;
  }
});
var simple = new SimpleClass('Jhon');

// класс с авто-расширением
var AutoExtendClass = basis.Class(null, {
  extendConstructor_: true,
  name: 'no name'
});
var autoExtend = new AutoExtendClass({
  name: 'Jhon', // переопределяем свойство описание в классе
  newProperty: 'something' // новое свойство
});

console.log(autoExtend.name);
// console> 'Jhon'
console.log(autoExtend.newProperty);
// console> 'something'
```

Почти у всех классов `basisjs` свойство `extendConstructor_` равно `true`.

## Расширения

Когда создается новый класс, он расширяется новыми свойствами. Из переданных, в качестве второго и последующих аргументов-объектов копируются свойства в прототип нового класса. Но перед тем как сохранить свойство, делается проверка — нет ли уже такого свойства в прототипе. Если значение есть и оно имеет метод `__extend__`, то этот метод вызывается с новым значением для прототипа, а в прототип сохраняется результат выполнения. В противном случае значение копируется в прототип как есть. Этот алгоритм иллюстрирует следующий код:

```js
for (var key in extension)
{
  var curValue = newClass.prototype[key];

  if (curValue && curValue.__extend__)
    newClass.prototype[key] = curValue.__extend__(extension[key]);
  else
    newClass.prototype[key] = extension[key];
}
```

Такая же логика используется при создании экземпляра класса с авто-расширением (свойство класса `extendConstructor_` == `true`). Этот подход позволяет сокращать количество кода при наследовании классов и создании экземпляров, делая код более простым и читаемым.

Например, все классы созданные `basis.Create` имеют метод `__extend__`. Если ему передать в качестве аргумента объект или функцию (но не "класс"), то будет создан и возвращен новый класс унаследованный от того, у которого был вызван метод. В противном случае метод вернет то значение, что ему передали.

```js
// создание класса, у которого в качестве
// свойства childClass другой класс
var MyClass = SomeClass.subclass({
  childClass: ChildClass
});

// явное создание класса
var obj = new MyClass({
  childClass: ChildClass.subclass({ ... })
});

// метод __extend__ у классов позволяет сократить код
var obj = new MyClass({
  childClass: { ... }
});
```

## ???

Созданные с помощью `basis.Class` классы поддерживают оператор `instanceof`.

```js
var Foo = basis.Class();
var Bar = Basus.Class(Foo);
var Baz = Basus.Class(Bar);

var baz = new Baz();

console.log(baz instanceof Baz);
// console> true

console.log(baz instanceof Bar);
// console> true

console.log(baz instanceof Foo);
// console> true

console.log(baz instanceof basis.Class.BaseClass);
// console> true
```

Получить доступ к классу экземпляра можно через его свойство `constructor`, а получить доступ к супер-классу класса можно через свойство `superClass_`. Свойство `superClass_` может использоваться только для отладки в `dev` режиме.

```js
var Foo = basis.Class(null, { className: 'Foo' });
var Bar = basis.Class(Foo);

var bar = new Bar();

console.log(bar.constructor === Bar);
// console> true

console.log(bar.constructor.superClass_ === Foo);
// console> true

// выводим список наследования классов
var cls = Bar;
while (cls)
{
  console.log(cls.className);
  cls = cls.superClass_;
} 
// console> subclass of Foo
// console> Foo
// console> basis.Class
```

## Преобразование класс <-> экземпляр

## Расширяемые поля

Существует несколько вспомогательных функций, создающие расширяемые свойства, то есть такие свойства, которые не перезаписываются, а пораждают новое значение на основе текущего и нового значения. Принцип их работы основан на расширении через метод `__extend__`. То есть они создают такие объекты, у которых есть метод `__extend__`, создающий объекты которые имеют такой же метод `__extend__`.

### extensibleProperty

Обычное дополняющее свойство.

```js
var Foo = basis.Class(null, {
  data: basis.Class.extensibleProperty({  // ключи по умолчанию
    foo: 1,
    bar: 2
  })
});
var Baz = Foo.subclass({
  data: {
    bar: 'baz',
    baz: 123
  }
});

console.log(Baz.prototype.data);
// console> { foo: 1, bar: 'baz', baz: 123 }

var baz = new Baz({
  data: {
    baz: 'baz',
    basis: true
  }
});
console.log(baz.data);
// console> { foo: 1, bar: 'baz', baz: 'baz', basis:true }

Foo.prototype.data.foo = 333;
console.log(Baz.prototype.data);
// console> { foo: 333, bar: 'baz', baz: 123 }
console.log(baz.data);
// console> { foo: 333, bar: 'baz', baz: 'baz', basis:true }
```

### customExtendProperty

То же, что и extensibleProperty, но позволяет определить собственную функцию дополения. `extensibleProperty` эквивалентно `customExtendProperty({}, basis.object.extend)`.

```js
var Foo = basis.Class(null, {
  data: basis.Class.extensibleProperty({  // ключи по умолчанию
    foo: 1,
    bar: 2
  }, basis.object.complete)  // задав complete вместо extend, свойство data
                             // будет расширяться только новыми ключами
});
var Baz = Foo.subclass({
  data: {
    bar: 'baz',              // это свойство будет проигнорировано
    baz: 3
  }
});

console.log(Baz.prototype.data);
// console> { foo: 1, bar: 2, baz: 123 }

var baz = new Baz({
  data: {
    baz: 'baz',
    basis: true
  }
});
console.log(baz.data);
// console> { foo: 1, bar: 2, baz: 3, basis:true }

Foo.prototype.data.foo = 333;
console.log(Baz.prototype.data);
// console> { foo: 333, bar: 2, baz: 3 }
console.log(baz.data);
// console> { foo: 333, bar: 2, baz: 3, basis:true }
```

### nestedExtendProperty

Создает такой объект, у которого значения `extensibleProperty`. basis.event.Emitter#listen пример такого свойства.

```js
var Foo = basis.Class(null, {
  data: basis.Class.nestedExtendProperty({})
});
var Baz = Foo.subclass({
  data: {
    prop: {
      a: 1,
      b: 2
    }
  }
})

var baz = new Baz({
  data: {
    prop: {
      b: 777,
      c: 3
    },
    more: {
      x: 1
    }
  }
});

console.log(baz.data);
// console> { prop: { a: 1, b: 777, c: 3 }, more: { x: 1 } }
```

### oneFunctionProperty

Создает объект, в котором для любого ключа значением является одна и та же функция. Обычно это триггеры событий.

```js
basis.require('basis.event');

var Foo = basis.event.Emitter(null, {
  events: basis.Class.oneFunctionProperty(function(){
    this.doStuff();
  }, {
    event1: true,
    event2: true 
  }),
  init: function(){
    this.addHandler(this.events, this);
  },
  doStuff: function(){
    // do cool stuff 
  }
});

var foo = new Foo({
  events: {
    event1: false,
    update: true
  }
});

console.log(foo.events);
// console> {
//            event1: null,
//            event2: function(){ this.doStuff() },
//            update: function(){ this.doStuff() },
//          }
```

## Хелперы

### SELF

Хелпер `basis.Class.SELF` позволяет классу сослаться на себя, в момент своего создания.

```js
// без хелпера
var TreeNode = basis.ui.subclass({
  ...
});
TreeNode.extend({
  childClass: TreeNode
});

// с хелпером
var TreeNode = basis.ui.subclass({
  childClass: basis.Class.SELF,
  ...
});
```

### isClass
