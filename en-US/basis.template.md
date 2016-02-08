# Templates (basis.template)

Module `basis.template` covers all work connected with parsing templates, and
building metadata needed for instantiation of templates.

Module entry point is `basis.template.Template` class. This class is responsible
for creation and destruction of template instances. Basically it's a base abstract
class for different template fabric's (such as basis.template.html.Template).
Destruction handles DOM nodes removal and cleaning links in related views and
bound objects (see binding bridge).

Basis.js template structure is based on DOM and nearly repeats it. As most template
engines are generating `HTML` as an output and then convert it to `DOM` using
`innerHtml` technique, basis works differently. Basis compiles html
into in memory DOM structure and then attaches it into existent DOM. This
approach is the key to very effective templates.

Basis.js templates have no syntax for defining loops and conditional calculations,
this features become unnecessary due to effective and simple databindings.
Template syntax is an extended `HTML` (see more [`Template syntax`](basis.template_format.md)).

`basis.template` supports theming. Which is basically template collections with
rules of applications.

## Using templates

`basis.template.html.Template` is used to create instances of templates.

```js
var Template = basis.require('basis.template.html').Template;

var template = new Template('<h1>hello world</h1>');
```

`basis.template.html.Template` constructor takes the only argument - the source
of template string. You may use different data types as source, such as:

  * function with no arguments that returns template string;

  * string - sure why not 8);

  * object implementing interface [`binding bridge`](bindingbridge.md). Binding
  bridge is interface for databinding implementation it allows your pass
  variable as template string and subscribe to it's value modification. Thus you
  got flexible template definition. You won't implement it this interface by
  yourself, more likely you wil use [`resources`](resources.md) and `basis.template.SourceWrapper`
  instances;

  * you may also specify an already [`parsed template structure`](basis.template_advanced.md)
  as an input, but this is an advanced topic, so we describe this data seperately
  from main article.

  * other types are converted to string using standart method and passed as
  template string


Templates are used in base view classes that are `basis.ui.Node`,
`basis.ui.PartitionNode` and their descendants. This classes handle all work of
creation template instances and applying data synchronization rules to them. So
work is divided into several steps:

  * Defining template. (see more [`syntax`](basis.template_format.md))

  * Defining [`databindings`](basis.ui_bindings.md)

  * Defining [`action`](basis.ui_actions.md)

All basis.js objects are created using [`basis.Class`](basis.class.md) mixin, which
supports an [`autoexpansion magic`](basis.class.md#Autoexpansion). This feature
allows you to use shortcut syntax for template definition inside views:

```js
var Node = basis.require('basis.ui').Node;
var Template = basis.require('basis.template.html').Template;

var Foo = Node.subclass({
  // shortcut:
  template: '<h1>hello world</h1>'
  // the long version is:
  template: new Template('<h1>hello world</h1>')
});

var node = new Node({
  template: basis.resource('path/to/template.tmpl')
});
```

Template string may be changed anytime by using `setSource` this will lead to
immediate template recompilation.

NOTE: we discussed the possibility to pass mutable variable as template string
if it's implementing [`binding bridge`](bindingbridge.md). So this is just
another option.

Feature that allows basis.js to work with mutable template strings underlies the
[`live update`](basis.template_liveupdate.md) mechanism, that allows developer to
see changes right away after applying them, without refreshing browser page.
(basis server is needed to enable this feature)
