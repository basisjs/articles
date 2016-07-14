# basis.Class (Classes)

A `basis.Class` function and its methods simplify the process of designing classes. Inheritance relies on prototype-based javascript inheritance.
<!-- MarkdownTOC -->

- [Creating classes](#creating-classes)
- [Class properties](#class-properties)
- [Inheritance](#inheritance)
- [The life cycle of an instance](#the-life-cycle-of-an-instance)
- [Creating instance patterns](#creating-instance-patterns)
- [Autoextending](#autoextending)
- [How to check if an object is an instance of a given class](#how-to-check-if-an-object-is-an-instance-of-a-given-class)
- [Class to instance transormation](#class-to-instance-transormation)
- [Extensible properties](#extensible-properties)
    - [extensibleProperty](#extensibleproperty)
    - [customExtendProperty](#customextendproperty)
    - [nestedExtendProperty](#nestedextendproperty)
    - [oneFunctionProperty](#onefunctionproperty)
- [Helpers](#helpers)
    - [SELF](#self)
    - [isClass](#isclass)

<!-- /MarkdownTOC -->

## Creating classes

Classes in `basis.js` are created with a `basis.Class` function or with its alias `basis.Class.create`. The function takes an arbitrary number of arguments: the first one is a class to inherit from (a parent class), the second and subsequent arguments expand your class. If it is not supposed for a new class to have a parent class, the first argument must be `null`.

```js
// class Foo
var Foo = basis.Class(null, {
  name: 'default'
});

// class Bar inherits Foo
var Bar = basis.Class(Foo, {
  property: 1,
  method: function(){
    // ...
  }
});
```

As an extension one can provide:

  * an object – all object properties (including those that are in prototype chain) will be copied to the new class prototype;

  * a class created with `basis.Class` - all properties from this class prototype will be copied;

  * a function – in that case a function execution result will be copied, the function itself will get a superclass prototype as an argument; this approach is usefull for creating mixins.

```js
var Foo = basis.Class(null, {
  say: function(){
    return 'foo';
  }
});
var Bar = basis.Class(null, {
  say: function(){
    return 'bar';
  }
});

var mixin = function(super_){
  // `super` is a reserved name, so `super_` is used.
  // for Mix1: super_ === Foo.prototype
  // for Mix2: super_ === Bar.prototype
  return {
    say: function(){
      return super_.say.call(this) + ' and mixin';
    }
  };
};

var Mix1 = basis.Class(Foo, mixin);
var Mix2 = basis.Class(Bar, mixin);


var mix1 = new Mix1();
console.log(mix1.say());
// console> foo and mixin

var mix2 = new Mix2();
console.log(mix2.say());
// console> bar and mixin
```

For the convenience of debugging one can specify a `className` property in the extension of a new class. In this case, development tools will show more relevant name of the instance.

![className usage example](../ru-RU/img/className-in-console.png)

## Class properties

  * className – a class name;
  * basisClassId_ – the unique identifier of the class, it is available only in `dev` mode and is used for debugging purposes;
  * superClass_ – link to a parent class;
  * extendConstructor_ – a constructor, autoextension of an instance is used here (see [Creating instance patterns](#creating-instance-patterns));
  * \_\_extend\_\_ – autoextension method, creates a new class depending on a passed argument, the new class inherits from the current class (see "[Autoextension](#autoextension)");
  * isSubclassOf – method determines if the current class is the child of another class
    ```js
      var Foo = basis.Class();
      var Bar = Foo.subclass(Foo);

      console.log(Bar.isSubclassOf(Foo));
      // console> true
    ```

  * extend – a method to expand a ptototype class;
  * subclass – a method to create a new class inherited from the current class. Can be an alternative to `basis.Class`; following lines are equivalent
    ```js
    var MyClass = basis.Class(SomeClass,  { .. });
    var MyClass = SomeClass.subclass({ .. });
    ```

## Inheritance

Any property can be reassigned in a new class. Superclass'es properties can be accessed through `prototype` property of the superclass.

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

## The life cycle of an instance


## Creating instance patterns

## Autoextending


## How to check if an object is an instance of a given class


## Class to instance transormation

...

```js
var Node = basis.require('basis.ui').Node;
var data = [...];
var nodes = [];

for (var i = 0; i < data.length; i++)
  nodes.push(new Node({
    template: resource('./path/to/node.tmpl'),    // !!!
    name: data[i],
    childClass: {                                 // !!!
      template: resource('./path/to/item.tmpl'),  // !!!
      binding: {                                  // !!!
        title: 'data:'
      }
    }
  }));
```

Lines marked with `!!!` point to problems. In this case there will be created an extra `basis.template.html.Template` instance for every `basis.ui.Node` instance. Meaning one and the same template source will be processd for every node instance. As well as that piece of code will create its own class for child nodes, each of them will create its own template instance and a new `binding` object. It will be better to do this way:

```js
var Node = basis.require('basis.ui').Node;
var data = [...];
var nodes = [];
var MyNode = Node.subclass({
  template: resource('./path/to/node.tmpl'),    // !!!
  childClass: {                                 // !!!
    template: resource('./path/to/item.tmpl'),  // !!!
    binding: {                                  // !!!
      title: 'data:'
    }
  }
})

for (var i = 0; i < data.length; i++)
  nodes.push(new MyNode({
    name: data[i]
  }));
```

There will be no extra objects in this case.

## Extensible properties

An extensible property is a property that can not be overwritten. Instead it generates a new value based on the current value and a new value.
There are a few auxiliary functions that create extensible properties.
Those functions create such objects that have the `__extend__` method which creates objects with the same `__extend__` method

### extensibleProperty

Plain additional property.

```js
var Foo = basis.Class(null, {
  data: basis.Class.extensibleProperty({  // default keys
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

Same as an extensibleProperty, but allows to define your own ..addition..function. `extensibleProperty` is equivalent to `customExtendProperty({}, basis.object.extend)`.

```js
var Foo = basis.Class(null, {
  data: basis.Class.extensibleProperty({  // default keys
    foo: 1,
    bar: 2
  }, basis.object.complete)  // If `complete` is used instead of `extend`, the `data` property
                             // will be extended with only new keys
});
var Baz = Foo.subclass({
  data: {
    bar: 'baz',              // this property will be ignored
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

Creates such an object which values are `extensibleProperty`. `basis.event.Emitter#listen` is a good example.

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

It creates an object that for any key value is the same function. Typically, event triggers are such things.

```js
var Emitter = basis.require('basis.event').Emitter;

var Foo = Emitter(null, {
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

## Helpers

### SELF

Helper `basis.Class.SELF` allows a class to refer to itself at the moment of its creation. This is useful, for example, when creating a recursive classes.

```js
// without helper
var TreeNode = basis.ui.subclass({
  ...
});
TreeNode.extend({
  childClass: TreeNode
});

// with helper
var TreeNode = basis.ui.subclass({
  childClass: basis.Class.SELF,
  ...
});
```

### isClass

An `isClass` function checks whether the value is a class, meaning a function created with `basis.Class`.

```js
var Foo = basis.Class();
var Bar = function(){};

console.log(typeof Foo);
// console> 'function'
console.log(basis.Class.isClass(Foo));
// console> true

console.log(typeof Bar);
// console> 'function'
console.log(basis.Class.isClass(Bar));
// console> false
```
