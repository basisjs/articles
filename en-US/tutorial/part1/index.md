# Tutorial. Part 1. Getting Started, views, modules, tools

[Contents](../index.md)

**Sections**
<!-- MarkdownTOC -->

- [Getting started](#getting-started)
- [Preparations](#preparations)
    - [Dev-server](#dev-server)
    - [Index file and adding basis.js](#index-file-and-adding-basisjs)
- [Our first view](#our-first-view)
- [Modules](#modules)
    - [Advantages of using modules](#advantages-of-using-modules)
- [Bindings and actions](#bindings-and-actions)
- [A list](#a-list)
- [Composition \(?\)](#composition-)
    - [Satellites](#satellites)
- [Tuning file structure](#tuning-file-structure)
- [Tools](#tools)
- [Build process](#build-process)
- [Outro](#outro)

<!-- /MarkdownTOC -->

## Getting started

We'll cover how to start working with `basis.js` and what tools we may use. We will create a few simple views, and will talk about modules in a project sctructure and about file structure in a project in general.

## Preparations

We will need:

- a console (command line)
- a local web-server
- a browser (preferrably `Google Chrome`)
- your favorite text editor

Let start in a project folder. Assume the folder is empty.

### Dev-server

While developing there is no need to build a `basis.js`-project. Though it needs a web-server. Any web-server may be sufficient, but it would be better to use a dev-server, which comes with `basisjs-tools`. That server gives more opportunities during a development process.

`basisjs-tools` is a set of command line tools written on `javascript` and running with `node.js`. The set includes a builder, a dev-server and a code generator. It can be installed with `npm`:

    > npm install -g basisjs-tools

When installed globally (with `-g` flag) it gives a new command `basis` in the console.

Let's run dev-server:

    > basis server

The server will start on `8000` port (it can be changed with a flag `--port` or `-p`). Now one can open this link `http://localhost:8000` in a browser and make sure that the server is working. Though it shows an error since our project folder is still empty. Let's fix it!

### Index file and adding basis.js

First of all one needs to add a folder with `basis.js` source files into the project. For this one may either clone the [repository](https://github.com/basisjs/basisjs) or use `npm`:

    > npm install basisjs

Let's create `index.html` - a main `html`-file of the app. At first it only adds `basis.js`.

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>My first app on basis.js</title>
</head>
<body>
  <script src="node_modules/basisjs/src/basis.js" basis-config=""></script>
</body>
</html>
```

Nothing unusual up to now. The only thing that may draw a question is a `basis-config` attribute in the `<script>` tag.

That attribute tells `basis.js` core where to find `<script>` tag, in which the framework was added. It is necessary to define a path to `basis.js` source files and to resolve paths to its modules.

## Our first view

For now our page is a tabula rasa. Let's add some sense into it and output classic "Hello world".

Let's create a view with a following representaion:

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>My first app on basis.js</title>
</head>
<body>
  <script src="node_modules/basisjs/src/basis.js" basis-config=""></script>
  <script>
    var Node = basis.require('basis.ui').Node;

    var view = new Node({
      container: document.body,
      template: '<h1>Hello world!</h1>'
    });
  </script>
</body>
</html>
```

After the page refresh one can see "Hello world!". As it was planned. What have just happened here?

To start with we said we need `basis.ui` module, using a `basis.require` function. This function is almost the same as `require` function in `node.js`. It can include modules by its' names or by its' file names. In this case `basis.ui` is a module name. As we'll see, this function can "include" any file by its name.

We needed `basis.ui` module, because it provides all necessary things for building interfaces. However this module requires other modules, one may not think about it, because `basis.js` will do the work. One should require only those modules which are explicitly used in the code that one writes.

Secondly we created a representaion itself as a `basis.ui.Node` class instance. Let's not be confused with the name `Node` instead of classic `View`. The thing is in `basis.js` all components and representations are put one into another. Thus a certain block might look like as a whole thing, but in fact may consists of a plenty of sub-representaions (nodes).

> The whole interface is organized as a big tree. Representation nodes of the app are the tree nodes. One can transform the tree adding, deleting and moving those nodes. The tree API has a lot in common with the browser `DOM`. We will cover it later.

In the meantime, let's see how we created the representation. Firstly we passed to the constructor an object with some "settings" - a config. Setting a `container` property we pointed out where to put the representation's `DOM`-fragment when it will be ready. It must be a `DOM`-element. The `template` property describes a template (who would've thought!). That description was added directly in the config. This option is handy for quick prototyping and for examples. But for real applications it is not a good practice at all. We'll change this part of the example later.

## Modules

While developing we try to isolate logical parts of our app and put those parts in separate files. Less code in a file, easier to work with it. Ideally a module's code should fit into one screen, a maximum of two. But, of course, there are always exceptions.

Let's move a representation code into a separate module. To do this, create a file `hello.js` and move lines from `<script>` into it.

And that's all for now. Just include this new module in `index.html`:

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>My first app on basis.js</title>
</head>
<body>
  <script src="node_modules/basisjs/src/basis.js" basis-config=""></script>
  <script>
    basis.require('./hello.js');
  </script>
</body>
</html>
```

Again one can `basis.require` function, but now its argument is a path to a file. It's important to start the path with `./`, `../` or `/`. This tells to `basis.require` to treat the argument as a path to a file not as a module name. The same convention works in `node.js`.

Continue to modularity. For example why do we need `html` in a javascript file? Let's move it to a separate file, name it `hello.tmpl`. See the changes in our module:

```js
var Node = basis.require('basis.ui').Node;

var view = new Node({
  container: document.body,
  template: basis.resource('./hello.tmpl')
});
```

The difference is a stirng describing a template was replaced with a call to a `basis.resource` function. This function creates an "interface" to the file. This approach makes it possible to determine which files are really needed, and download them not earlier than there is need for them.

An interface created by `basis.resource` is a function with extra methods. A call to this function or to its method `fetch` downloads the file. The files is loaded only once, and the result is cached. More details on that can be found in an article [Resources (modularity)](../../resources.md).

And one more thing. Call to `basis.require('./file.name')` is equivalent to `basis.resource('./file.name').fetch()`.

In this case `basis.require` can be used. But more often case is when templates are described directly in classes. And there is no need to load a file before at least one instance of the class is created. We'll see it later in examples. For uniformity reasons it is better to use `basis.resource` when assigning a template to a node.

### Advantages of using modules

When the code is described in a separate file and is connected as a module, it is wrapped in a special way, and several additional variables and functions  became available in the code.

For example, the file name can be obtained from a variable `__filename`, and the folder name where the module was placed can be obtained from a variable` __dirname`.

But more important is that local functions `require` and `resource` became available too. They work the same way as `basis.require` and `basis.resource`, except the way how relative file paths are resolved. If the function `basis.require` and `basis.resource` are provided with a relative path, it is resolved with respect to `html` file (in our case it is `index.html`). At the same time, `require` and` resource` resolve such a path relative to the module (ie, to the its `__dirname`).

It is more convenient to use local functions and `require`` resource` inside modules. So the code in `hello.js` is a little easier now:

```js
var Node = require('basis.ui').Node;

var view = new Node({
  container: document.body,
  template: resource('./hello.tmpl')
});
```

> Modularity provides additional capabilities not only to `javascript` modules, but also to other types of content. For example, if the description of the template lies in a separate file, it is not necessary to update the page when it changes. Once the changes have been saved, all instances of the representations that use the modified template, update their own `DOM` fragments. And all this happens without reloading the page, maintaining the current state of the application.

The same applies to the `css` files, to localization files and to some other file types. The only changes that require a page reload are changing the `html` file and changing any `javascript` modules that have already been initialized.

It is the dev-server from `basisjs-tools` who provides this mechanism of updatig files. This is one of the main reasons why it is wise to use it, rather than the usual web server.

Let's try how it works. Create a file `hello.css`, like this:

```css
h1
{
  color: red;
}
```

And let's change slightly the template (`hello.tmpl`):

```html
<b:style src="./hello.css"/>
<h1>Hello world!</h1>
```

Once the template changes are saved, the text turns red. There is no need to refresh the page.

In the template, we have added a special tag `<b: style>`. This tag says that when you use this template, you need to connect the specified stylesheet to the page. Relative paths are resolved with respect to the template file. Any number of stylesheet files can be connected to a template. We do not need to worry about adding and removing styles. The framework takes  care of it.

So, we have just created a simple static view. But in web applications it is all about dynamics. So let's try to use ​in the template some values ​from the presentation and try to somehow communicate with it. For the first one can use _bindings_, and for the second - for communication - _actions_.

## Bindings and actions

Bindings allow to transfer values ​​from a representation to its `DOM` fragment. Unlike most template systems, `basis.js` templates have no direct access to properties of a representation. And so bindings can use only those values ​​that the representation itself provides to a template.

To set ​​which values will be available in a given template, use a `binding` property in a description of an instance or of a class that inherits from `basis.ui.Node`. The values (bindings) are described in the form of the object, where keys are names that will be available in the template, and each value (of a `basis.ui.Node.binding` object) is a function that calculates a corresponding value (a binding) for the template. So the function only parameter is the owner of the template, that is the representation itself. This is how you can provide a `name` value in a template:

```js
var Node = require('basis.ui').Node;

var view = new Node({
  container: document.body,
  name: 'world',
  template: resource('./hello.tmpl'),
  binding: {
    name: function(node){
      return node.name;
    }
  }
});
```

It is worth mentioning that the `binding` property is an [auto-extensible property](../../basis.Class.md#autoextending). When you set a new value for the property, or when you create an instance of the class, the new value extends the previous one, adding and overriding previous values. By default, `basis.ui.Node` already have [some useful properties](../../basis.ui_bindings.md#default-bindings), which can be used together with a certain contact `name`.

Let's change the template (`hello.tmpl`) to use the `name`.

```html
<b:style src="./hello.css"/>
<h1>Hello, {name}!</h1>
```

TODO markers - special inserts are used in the template. They are used to obtain links on certain parts of the template and placement values. These inserts are specified in curly brackets. In this case, we have added a `{name}`, insert the values ​​as plain text.

Description Template looks like a description of the format of other template systems. But unlike them, `basis.js` template works with` DOM` nodes. For a description of this item `<h1>` will be created, which will contain three text node `Hello,`, `{name}` and `!`. The first and last are static, and the text will not change. But the average value will be marked from (will change its property `nodeValue`).

But enough words, let's update the page and look at the result!

TODO Now add a field that will introduce the name and that it is substituted in the title. Let's start with a template:

```html
<b:style src="./hello.css"/>
<div>
  <h1>Hello, {name}!</h1>
  <input value="{name}" event-keyup="setName"/>
</div>
```

TODO The template added element `<input>`. For his `value` attribute uses the same Binding as the title -` {name} `. But it works only for entries in `DOM`.

To view reacted to the events in his `DOM` fragment desired item is added to the attribute whose name is the name of the event with the prefix` event-`. We can add the execution of the action to any element to any event. And on one event action can be somewhat, the main divide action names with a space.

In our example, we added an attribute `event-keyup`, which obliges the idea to perform an action` setName`, when an event is triggered `keyup`. If the submission is not some kind of action will be determined in the console we will see a warning message about this and nothing else will happen.

And now add the description of the action. To do this, use the property `action`. It works similar to `binding`, but only describes the action. Options in `action` receive an event object parameter. This is not the original event and the copy with additional methods and properties (the original is kept in the event of his property `event_`).

TODO Here's how an idea will look now ( `hello.js`):

```js
var Node = require('basis.ui').Node;

var view = new Node({
  container: document.body,
  name: 'world',
  template: resource('./hello.tmpl'),
  binding: {
    name: function(node){
      return node.name;
    }
  },
  action: {
    setName: function(event){
      this.name = event.sender.value;
      this.updateBind('name');
    }
  }
});
```

TODO Here we read a value from the `event.sender`, as an element, in which the event occurred -` <input> `. In order for an idea to re-calculate the value and passes it to the template, we called the method `updateBind`.

TODO Calling explicitly recalculated values ​​need not always for the template. If you change the values ​​that are used to calculate the bindings, there are events that can be specified in the description of these events, and Binding will be recalculated automatically when they arise.

TODO Performances as a model, able to store data in the form of key-value. The data is stored in the property `data` and changing the method of` update`. When changing values ​​in the `data`, triggered event` update`. We use this mechanism to store name:

```js
var Node = require('basis.ui').Node;

var view = new Node({
  container: document.body,
  data: {
    name: 'world'
  },
  template: resource('./hello.tmpl'),
  binding: {
    name: {
      events: 'update',
      getter: function(node){
        return node.data.name;
      }
    }
  },
  action: {
    setName: function(event){
      this.update({
        name: event.sender.value
      });
    }
  }
});
```

Now `updateBind` is not called explicitly. But it requires more code to describe that binding this way. Luckily, there are helpers that reduce the description im the most common cases. One of the examples is synchronization with the `data` field. This binding can be written in a shorter form, like this:

```js
var Node = require('basis.ui').Node;

var view = new Node({
  container: document.body,
  data: {
    name: 'world'
  },
  template: resource('./hello.tmpl'),
  binding: {
    name: 'data:name'
  },
  action: {
    setName: function(event){
      this.update({
        name: event.sender.value
      });
    }
  }
});
```

The helper which was just used is only syntactic sugar. It will unfold in full form, which has been presented in the previous example. More details can be found in the article [Bindings](../../ basis.ui_bindings.md).

The main thing to remember is the following. A representation calculates and transmits values to its template, the `binding` property is used for that. The template captures and transmits events to its representation, it triggers actions listed in the `action` property. In other words `binding` and` action` are the two main points of contact between the representation and its template. At the same time, the representation knows almost nothing about how its template is organized, and the template knows nothing about the representation realisation. All the logic (`javascript`) is on the side of the representation, and all the work with `DOM` is on the side of the template. So, in most cases, a complete separation of logic and representation is achieved.

![Split logic and markup](../../../ru-RU/tutorial/part1/split_logic_markup.png)

## A list

## Composition (?)

### Satellites

## Tuning file structure

## Tools

## Build process

While developing there is no need to build your project. Everything works as it is. One need to build a project only for publushng purposes. It is a way to reduce a number of files and decrease its' size. For that kind of work one may need a builder form `basisjs-tools`.

As one may remember, we have changed our project structure a few times. When we start to develop it is not really clear how to organize modules and where to put all those files. Even more! During the work on a particular project tasks change, requirements change, effective solutions appear, bright ideas about better project structure come to us. So it is ok for a project structure to be modified from time to time.

The builder tries to understand the project structure. Almost like a human it opens files, reads them and understands.

In the beginning of the build process the builder takes a `html`-file (in out case it is `index.html`), finds there `<script>`, `<link rel="stylesheet">`, `<style>` and other tags. Understand which files where included. Next the builder analyzes these files, finds in them other instructions which require something else, etc. What kind of instructions do we mean here? For example in `javascript` files those insructions are `basis.require`, `basis.resource` and the like. For `css` files – `@import`, `url(..)`. Yu already know all those examples. So the buider recursively processes all files in that way and build an application graph. After that the builder analyzes links between files, reorganizes files and optimizes them. As a result of that work there will be a separate folder with a builded version of our project. And there will be significantly less files in that folder than in the source version of our project.

Let's build the project:

    > basis build

That's it! As a result we'll see three files in a `build` folder: `index.html`, `script.js` and `style.css`. This _is_ a builded verion of our app. To deploy our project the only thing we need is to copy those files to a production server.

There are few optimizations that are disabled by default. To learn more type:

    > basis build --help

The most common optimization is removing debugging code and compression of `javascript` and `css`. It can be applied with a `--pack` option (`-p` is a shortcut):

    > basis build --pack

We will see following:

![Result of running `basis build --pack`](../../../ru-RU/tutorial/part1/build.png)

So the builder does a lot of work! Besides when running with a `--verbose` option it shows all those tiny little details of its work. But we may care less about creating of a builded version of a project every time we need it. Instead we will develop the app itself and do other crazy stuff.

## Outro

We covered here core concepts for app development with `basis.js`, tried few ways to define views and how to organize files in your project.

Next part: [Dealing with data: models, data sets and values](../part2/index.md)
