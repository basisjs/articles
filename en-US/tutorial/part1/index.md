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

### Advantages of using modules

## Bindings and actions

## A list

## Composition (?)

### Satellites

## Tuning file structure

## Tools

## Build process

## Outro

We covered here core concepts for app development with `basis.js`, tried few ways to define views and how to organize files in your project.

Next part: [Dealing with data: models, data sets and values](../part2/index.md)
