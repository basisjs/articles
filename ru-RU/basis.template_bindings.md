# Правила применения значений биндингам

Различается 6 типов биндингов (см ["Биндинги"](basis.template_format.md#Биндинги)):

  * биндинги на узлы:

      * к элементу (тегу);

      * к текстовому узлу;

      * к коментарию;

  * биндинги в атрибутах:

      * в атрибуте `class`;

      * в атрибуте `style`;

      * в остальных атрибутах.

В зависимости от типа биндинга и назначаемого значения применяются разные правила.

Если для биндинга назначается то же значение, которое эквивалентно предыдущему (`===`), то никаких изменений в шаблоне не происходит.

## Биндинги на узлы

Узловым биндингам могут быть назначены:

  * браузерный `DOM` узел – в этом случае узел заменяется на переданный узел; если передается новый `DOM` узел, когда изначальный узел уже заменен, то предыдущий узел заменяется новым; если новое значение не является `DOM` узлом, то восстанавливается оригинальный (который был при создании экземпляра шаблона);

    ```js
    var Template = basis.require('basis.template.html').Template;

    var tmpl = new Template(
      '<div>' +
        '<div{example} class="original">' +
      '</div>'
    ).createInstance();

    console.log(tmpl.element.outerHTML);
    // console> <div><div class="original"></div></div>

    var foo = document.createElement('div');
    foo.className = 'foo';
    tmpl.set('example', foo);
    console.log(tmpl.element.outerHTML);
    // console> <div><div class="foo"></div></div>

    var bar = document.createElement('div');
    bar.className = 'bar';
    tmpl.set('example', bar);
    console.log(tmpl.element.outerHTML);
    // console> <div><div class="bar"></div></div>

    tmpl.set('example', null);
    console.log(tmpl.element.outerHTML);
    // console> <div><div class="original"></div></div>
    ```

    Если биндинг задан для нескольких узлов, и в качестве значения задается `DOM` узел, то этот узел применится только к первому узлу (заменит его). Для остальных элементов и текстовых узлов значение приводится к строке, для комментариев – игнорируется.

  * строка:

    * для элемента значение записывается в `innerHTML`;

      > Это поведение предмет для удаления в будущих версиях `basis.js`. Не рекомендуется использовать эту возможность.

    * для текстового узла значение записывается в `nodeValue`;

    * для комментария игнорируется;

  * другие значения для элемента и комментария игнорируются, для текстового узла записываются в `nodeValue`;

## Биндинги в атрибутах

В атрибутах могут быть только строковые значения, поэтому значения приводятся к строке. Когда меняется значение биндинга – заменяется значение атрибута. В атрибуте можно указывать несколько биндингов и любой дополнительный текст до и после биндинга.

```js
var Template = basis.require('basis.template.html').Template;

var tmpl = new Template(
  '<div title="страница {page} из {totalPage}"/>'
).createInstance();

console.log(tmpl.element.outerHTML);
// console> <div></div>

tmpl.set('page', 3);
tmpl.set('totalPage', 10)
console.log(tmpl.element.outerHTML);
// console> <div title="страница 3 из 10"></div>
```

Атрибуты `disabled`, `checked`, `selected` и `readonly` – особый случай. Их значение приводятся к `boolean`. Если заданное в шаблоне значение равнозначно `true`, то значением атрибута становится его название (например, `checked="checked"`). Иначе атрибут удаляется.

```js
var Template = basis.require('basis.template.html').Template;

var tmpl = new Template(
  '<input type="checkbox" checked="{foo}"/>'
).createInstance();

console.log(tmpl.element.outerHTML);
// console> <input type="checkbox">

tmpl.set('foo', 'something');
console.log(tmpl.element.outerHTML);
// console> <input type="checkbox" checked="checked">

tmpl.set('foo', false);
console.log(tmpl.element.outerHTML);
// console> <input type="checkbox">
```

### style

При изменении биндингов в атрибуте `style` заменяется не значение атрибута, а меняется соответствующее свойство в `style`. Если значение невалидно, то значение стиля не меняется.

> В случае неверного значения оно должно сбрасываться. Поэтому текущая реализация не верна и будет исправлена в будущих версиях.

[//]: # (Критично для <svg... style="fill:"/> Потому что у фрагмента svg внезапно может появиться черная заливка)

```js
var Template = basis.require('basis.template.html').Template;

var tmpl = new Template(
  '<div style="color: {color}"/>'
).createInstance();

console.log(tmpl.element.outerHTML);
// console> <div></div>

tmpl.set('color', 'red');
console.log(tmpl.element.outerHTML);
// console> <div style="color: red"></div>

tmpl.set('color', null);
console.log(tmpl.element.outerHTML);
// console> <div style="color: red"></div>

tmpl.set('color', '');
console.log(tmpl.element.outerHTML);
// console> <div style=""></div>
```

### class

Для атрибута `class` используются дополнительные правила, так как он является не обычным атрибутом, а списком значений ([DOMTokenList](https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList)). Для него не заменяется всё значение, как с другими атрибутами, а добавляются, удаляются или заменяются определенные классы - зависит от значения. Каждый биндинг в атрибуте обрабатывается отдельно.

По умолчанию применяются правила:

  * если значение число или строка – вставляется как есть (число приводится к строке); если значение является пустой строкой, то класс удаляется;

    ```js
    var Template = basis.require('basis.template.html').Template;

    var tmpl = new Template(
      '<div class="item {foo} {bar}">'
    ).createInstance();

    console.log(tmpl.element.outerHTML);
    // console> <div class="item"></div>

    tmpl.set('foo', 'test');
    console.log(tmpl.element.outerHTML);
    // console> <div class="item test"></div>

    tmpl.set('bar', 123);
    console.log(tmpl.element.outerHTML);
    // console> <div class="item test 123"></div>

    tmpl.set('foo', '');
    console.log(tmpl.element.outerHTML);
    // console> <div class="item 123"></div>
    ```

  * все другие значения приводятся к `boolean`; если значение равнозначно `true`, то вставляется класс с именем биндинга, иначе класс удаляется;

    ```js
    var Template = basis.require('basis.template.html').Template;

    var tmpl = new Template(
      '<div class="item {foo} {bar}">'
    ).createInstance();

    console.log(tmpl.element.outerHTML);
    // console> <div class="item"></div>

    tmpl.set('foo', 'test');
    console.log(tmpl.element.outerHTML);
    // console> <div class="item test"></div>

    tmpl.set('bar', true);
    console.log(tmpl.element.outerHTML);
    // console> <div class="item test bar"></div>

    tmpl.set('foo', false);
    console.log(tmpl.element.outerHTML);
    // console> <div class="item bar"></div>

    tmpl.set('bar', null);
    console.log(tmpl.element.outerHTML);
    // console> <div class="item"></div>
    ```

Это простые правила, но они ненадежны. Для определения того, как обрабатывать значение используется тег [`<b:define>`](basis.template_format.md#bdefine). Этот тег определяет два правила:

  * `bool` – значение всегда приводится к `boolean` и, в зависимости от результата, либо вставляется класс с именем биндинга, либо удаляется (не вставляется);

    ```js
    var Template = basis.require('basis.template.html').Template;

    var tmpl = new Template(
      '<b:define name="foo" type="bool"/>' +
      '<b:define name="bar" type="bool"/>' +
      '<div class="item {foo} {bar}">'
    ).createInstance();

    console.log(tmpl.element.outerHTML);
    // console> <div class="item"></div>

    tmpl.set('foo', 'test');
    console.log(tmpl.element.outerHTML);
    // console> <div class="item foo"></div>

    tmpl.set('bar', true);
    console.log(tmpl.element.outerHTML);
    // console> <div class="item foo bar"></div>

    tmpl.set('foo', 123);
    console.log(tmpl.element.outerHTML);
    // console> <div class="item foo bar"></div>

    tmpl.set('foo', 0);
    console.log(tmpl.element.outerHTML);
    // console> <div class="item bar"></div>
    ```

  * `enum` – определяет значение допустимых значений; если значение равно одному из списка (сравниваются как строки), то значение вставляется как класс, иначе класс удаляется (не вставляется);

    ```js
    var Template = basis.require('basis.template.html').Template;

    var tmpl = new Template(
      '<b:define name="foo" type="enum" values="ready processing"/>' +
      '<div class="item {foo}">'
    ).createInstance();

    console.log(tmpl.element.outerHTML);
    // console> <div class="item"></div>

    tmpl.set('foo', 'test');
    console.log(tmpl.element.outerHTML);
    // console> <div class="item"></div>

    tmpl.set('foo', 'ready');
    console.log(tmpl.element.outerHTML);
    // console> <div class="item ready"></div>

    tmpl.set('foo', 'selected');
    console.log(tmpl.element.outerHTML);
    // console> <div class="item"></div>
    ```

Определение `<b:define>` для всех биндингов в атрибуте `class`, является крайне желательным. Так как в таком случае возможно определение проблем в шаблонах и стилях, а так же минификация имен классов (подробнее в описании [`<b:define>`](basis.template_format.md#bdefine)).

Перед любым биндингом в атрибуте `class` может быть некоторая строка - префикс. Это позволяет избегать конфликта имен классов, так как разные биндинги могут иметь одинаковые значения.

```js
var Template = basis.require('basis.template.html').Template;

var tmpl = new Template(
  '<div class="item item_{foo} prefix{bar}">'
).createInstance();

console.log(tmpl.element.outerHTML);
// console> <div class="item"></div>

tmpl.set('foo', 'test');
console.log(tmpl.element.outerHTML);
// console> <div class="item item_test"></div>

tmpl.set('bar', 'test');
console.log(tmpl.element.outerHTML);
// console> <div class="item item_test prefixtest"></div>
```

## bindingBridge

Если назначаемое значение поддерживает интерфейс [`binding bridge`](bindingbridge.md), то шаблон использует его значение, полученное методом `bidingBridge.get()` и подписывается на изменения этого значения. Таким образом, значения с таким интерфейсом сами триггируют изменения в шаблоне, и нет необходимости самостоятельно передавать в шаблон их новое значение.

```js
var Template = basis.require('basis.template.html').Template;

var tmpl = new Template(
  '<span>{value}</span>'
).createInstance();

console.log(tmpl.element.outerHTML);
// console> <span>{value}</span>

var token = new basis.Token(123); // экземпляры basis.Token поддерживают bindingBridge

tmpl.set('value', token);
console.log(tmpl.element.outerHTML);
// console> <span>123</span>

token.set('value', 'hello world');   // меняем значение токена, а не сам шаблон
console.log(tmpl.element.outerHTML); // но значение в шаблоне обновляется
// console> <span>hello world</span>
```

Шаблон отписывается от изменений в случае назначения биндингу другого значения или в случае разрушения шаблона.
