# Правила применения значений биндингам

<!-- MarkdownTOC -->

- [Биндинги на узлах](#Биндинги-на-узлах)
- [Биндинги в атрибутах](#Биндинги-в-атрибутах)
  - [class](#class)
  - [style](#style)
- [bindingBridge](#bindingbridge)

<!-- /MarkdownTOC -->

В зависимости от типа биндинга и назначаемого значения применяются разные правила. Основные сценарии (см ["Биндинги"](basis.template_format.md#Биндинги)):

  * [биндинг на узел](#Биндинги-на-узлах):

      * к элементу (тегу);

      * к текстовому узлу;

      * к коментарию;

  * биндинг в атрибуте:

      * в атрибуте [`class`](#class);

      * в атрибуте [`style`](#style);

      * в [остальных атрибутах](#Биндинги-в-атрибутах).

Если для биндинга назначается то же значение, которое эквивалентно предыдущему (`===`), то никаких изменений в шаблоне не происходит.

## Биндинги на узлах

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

Атрибуты `disabled`, `checked`, `selected` и `readonly` – особый случай. Их значение приводится к `boolean`. Если заданное в шаблоне значение равнозначно `true`, то значением атрибута становится его название (например, `checked="checked"`). Иначе атрибут удаляется.

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

### class

Для атрибута `class` используются дополнительные правила, так как он является списком значений ([DOMTokenList](https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList)). Для него не заменяется всё значение целиком, как с другими атрибутами, а добавляются или удаляются имена классов отдельными операциями. Каждый биндинг в атрибуте обрабатывается отдельно.

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

Эти правила достаточны для простых сценариев. Но являются ненадежными, так как могут приводить к непредсказуемому результату. Кроме того они не безопасны, так как, например, не любая строка может быть именем классом.

Для того чтобы зафиксировать возможные значения биндига в атрибуте `class` используется инструкция [`<b:define>`](template/element/b-define.md). Она позволяет получать предсказуемые имена классов в разметке и облечает ее статический анализ для выявления проблем в шаблонах и стилях (подробнее в описании [`<b:define>`](template/element/b-define.md)).

Перед любым биндингом в атрибуте `class` может быть некоторая строка - префикс. Это позволяет избегать конфликта имен классов, так как разные биндинги могут иметь одинаковые значения.

```js
var Template = require('basis.template.html').Template;

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

## bindingBridge

Если назначаемое значение поддерживает интерфейс [`binding bridge`](bindingbridge.md), то шаблон использует его значение, полученное методом `bindingBridge.get()` и подписывается на изменения этого значения. Таким образом, значения с таким интерфейсом сами триггируют изменения в шаблоне, и нет необходимости самостоятельно передавать в шаблон их новое значение.

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
