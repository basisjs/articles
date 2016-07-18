# &lt;b:include&gt;

`<b:include>` используется для включения в описание шаблона другого описания (шаблона).

<!-- MarkdownTOC -->

- [Атрибуты](#Атрибуты)
  - [Ссылка на включаемый шаблон](#Ссылка-на-включаемый-шаблон)
- [Изоляция стилей](#Изоляция-стилей)
- [Вставка контента](#Вставка-контента)
- [Инструкции](#Инструкции)
  - [&lt;b:style>](#ltbstyle)
  - [&lt;b:before>](#ltbbefore)
  - [&lt;b:after>](#ltbafter)
  - [&lt;b:prepend>](#ltbprepend)
  - [&lt;b:append>](#ltbappend)
  - [&lt;b:replace>](#ltbreplace)
  - [&lt;b:remove>](#ltbremove)
  - [&lt;b:attr>, &lt;b:set-attr>](#ltbattr-ltbset-attr)
  - [&lt;b:append-attr>](#ltbappend-attr)
  - [&lt;b:remove-attr>](#ltbremove-attr)
  - [&lt;b:class>, &lt;b:append-class>](#ltbclass-ltbappend-class)
  - [&lt;b:set-class>](#ltbset-class)
  - [&lt;b:remove-class>](#ltbremove-class)
  - [&lt;b:add-ref>](#ltbadd-ref)
  - [&lt;b:remove-ref>](#ltbremove-ref)
  - [&lt;b:role>, &lt;b:set-role>](#ltbrole-ltbset-role)
  - [&lt;b:remove-role>](#ltbremove-role)
  - [&lt;b:show>, &lt;b:hide>, &lt;b:visible>, &lt;b:hidden>](#ltbshow-ltbhide-ltbvisible-ltbhidden)

<!-- /MarkdownTOC -->

## Атрибуты

Для тега можно указать следующие атрибуты:

- [`src`](#Ссылка-на-включаемый-шаблон) – ссылка на подключаемое описание (другой шаблон)
- `no-style` – включается только разметка, все стили игнорируются
- [`isolate`](#Изоляция-стилей) – указывает, что стили и разметку нужно изолировать (путем добавления именам классам некоторого префикса) перед включением
- `role` – позволяет задать пространство имен для ролей в подключаемой разметке; подробнее в [Роли](role.md)
- `id` → `<b:set-attr name="id" value="(значение атрибута)">`
- `class` → `<b:append-class value="(значение атрибута)">`
- `ref` → `<b:add-ref name="(значение атрибута)">`
- `show` → `<b:show expr="(значение атрибута)">`
- `hide` → `<b:hide expr="(значение атрибута)">`
- `visible` → `<b:visible expr="(значение атрибута)">`
- `hidden` → `<b:hidden expr="(значение атрибута)">`

### Ссылка на включаемый шаблон

Включаемое содержимое может быть:

- внешним файлом, в этом случае указывается относительный или абсолютный путь к файлу; относительные пути (начинаются не с `/`) разрешаются относительно файла шаблона или относительно корня приложения, если описание находится не в отдельном файле;

```html
<b:include src="./path/to/file.tmpl"/>
```

- именованным шаблоном определенным с помощью `basis.template.define()` (подробнее ["Темы"](../basis.template_theme.md)) – указывается имя шаблона, без дополнений

```html
<b:include src="foo.bar.baz"/>
```

- экземпляром `basis.template.Template` – указывается идентификатор шаблона (значение свойства `templateId`) предваренный `#`; в основном используется внутренними механизмами и для тестов

```html
<b:include src="#123"/>
```

```js
var Template = require('basis.template.html').Template;
var foo = new Template('...');
var bar = new Template('<div class="wrapper"><b:include src="#' + foo.templateId + '"/></div>');
```

- содержимое тега `<script type="text/basis-template">` – указывается ссылка вида `id:name`, где `name` является значением атрибута `id` у `<script>`; eсли элемент успешно найден в документе, то для описания шаблона используется его содержимое

```html
<script type="text/basis-template" id="my-template">
  ...
</script>
```

```html
<b:include src="id:my-template"/>
```

## Изоляция стилей

Для [изоляции](isolate-style.md) стилей подключаемого шаблона используется атрибут `isolate`. При этом генерируется уникальный префикс и подставляется всем именам классов, как в разметке так и в CSS:

`template.tmpl`:

```html
<b:style>
  .some-class {
    color: red;
  }
</b:style>

<div>
  <div class="some-class">Компонент</div>
  <b:include src="./include.tmpl" isolate/>
</div>
```

`include.tmpl`:

```html
<b:style>
  .some-class {
    border: 1px solid gold;
  }
</b:style>

<div class="some-class">Подключаемый шаблон</div>
```

В результате будет сгенерировано следующее содержимое:

```css
.some-class {
  color: red;
}
.e1tn45k29ie01hl1__some-class {
  border: 1px solid gold;
}
```

```html
<div>
  <div class="some-class">Компонент</div>
  <div class="e1tn45k29ie01hl1__some-class">Подключаемый шаблон</div>
</div>
```

Таким образом, не смотря на то, что в обоих шаблонах использовался одинаковое имя класса, использование атрибута `isolate` позволило избежать конфликта имен.

Иногда необходимо задать дополнительные стили подключаемой разметке. Для этого можно задать конкретный префикс или поместить стили внутрь `<b:include>`.

Для того чтобы зафиксировать префикс достаточно указать значение атрибуту `isolate`:

`template.tmpl`:

```html
<b:style>
  ...
  .my-prefix_some-class {
    /* your styles */
  }
</b:style>
<b:include src="./include.tmpl" isolate="my-prefix__"/>
...
```

Результат:

```css
.some-class {
  color: red;
}
.my-prefix__some-class {
  border: 1px solid gold;
}
.my-prefix__some-class {
  /* your styles */
}
```

```html
<div>
  <div class="some-class">Компонент</div>
  <div class="my-prefix__some-class">Подключаемый шаблон</div>
</div>
```

В случае если `<b:style>` поместить внутрь `<b:include>`, то он начинает вести себя так, как будто бы находится внутри подключаемого шаблона. В этом случае используемый префикс не имеет значения:

```html
...
<b:include src="./include.tmpl" isolate/>
  <b:style>
    .some-class {
      /* your styles */
    }
  </b:style>
...
```

Результат:

```css
.some-class {
  color: red;
}
.hd8rxdr902ywxiaw__some-class {
  border: 1px solid gold;
}
.hd8rxdr902ywxiaw__some-class {
  /* your styles */
}
```

```html
<div>
  <div class="some-class">Компонент</div>
  <div class="hd8rxdr902ywxiaw__some-class">Подключаемый шаблон</div>
</div>
```

Другие способы изолировать стили в [Изоляция стилей](isolate-style.md).

## Вставка контента

Содержимое `<b:include>` не обрамленное в [инструкции](#Инструкции) вставляется во включаемый шаблон согласно указанной в нем точки вставки. Такая точка определяется специальным тегом [`<b:content/>`](b-content.md).

Вложенные `<b:include/>` и `<b:content/>` вставляются по в подключаемый шаблон по тем же правилам.

```html
<b:include src="./button.tmpl">                <!-- <button><b:content/></button>-->
  <b:include src="./icon.tmpl" class="demo"/>  <!-- <i class="icon"/> -->
  Hello world!
</b:include>
```

Результат:

```html
<button>
  <i class="icon demo"/>
  Hello world!
</button>
```

## Инструкции

Внутри `<b:include>` могут быть другие специальные теги-инструкции, предназначенные для модификации подключаемого описания:

* [`<b:style>`](#bstyle) – добавление CSS стиля с теми же найстройками изоляции, что и подключаемая разметка
* [`<b:before>`](#bbefore) – вставлка до узла
* [`<b:after>`](#bafter) – вставка после узла
* [`<b:prepend>`](#bprepend) – вставка в начало элемента
* [`<b:append>`](#bappend) – вставка в конец элемента
* [`<b:replace>`](#breplace) – замена узела
* [`<b:remove>`](#bremove) – удаление узла
* [`<b:attr>`](#battr-bset-attr), [`<b:set-attr>`](#battr-bset-attr) – установка атрибута
* [`<b:append-attr>`](#bappend-attr) – добавление значения к значению атрибута
* [`<b:remove-attr>`](#bremove-attr) – удаление атрибута
* [`<b:class>`](#bclass-bappend-class), [`<b:append-class>`](#bclass-bappend-class) – добавление класса (классов) в атрибут `class`
* [`<b:set-class>`](#bset-class) – замещение значения атрибута `class`
* [`<b:remove-class>`](#bremove-class) – удаление класса (классов) из атрибута `class`
* [`<b:add-ref>`](#badd-ref) – добавление [ссылки](basis.template_format.md#Ссылки) на узел
* [`<b:remove-ref>`](#bremove-ref) – удаление [ссылки](basis.template_format.md#Ссылки) на узел
* [`<b:role>`](#brole-set-role), [`<b:set-role>`](#brole-set-role) – установка маркера роли
* [`<b:remove-role>`](#bremove-role) – удаление маркера роли
* [`<b:show>`](#bshow-bhide-bvisible-bhidden), [`<b:hide>`](#bshow-bhide-bvisible-bhidden), [`<b:visible>`](#bshow-bhide-bvisible-bhidden), [`<b:hidden>`](#bshow-bhide-bvisible-bhidden) – установление соотвествующего специального атрибута на элемент

Все остальные специальные теги приводят к предупреждению и игнорируются. Исключением являются `<b:include>` и `<b:content>`, которые [вставляются в подключаемый шаблон](#Вставка-контента) так же как свободная разметка (не обрамленная в специальные теги).

### &lt;b:style>

Работает так же как и [`<b:style>`](b-style.md) вне `<b:include>`, за тем исключением, что вставляемый CSS изолируется в рамках включаемой разметки. Имеет смысл, только если у `<b:style>` используется атрибут `ns` или у `<b:include>` – атрибут [`isolate`](#Изоляция-стилей).

Общий принцип работы:

- перенести `<b:style>` во включаемый шаблон
- если у `<b:style>` используется атрибут [`ns`](b-style.md#Изоляция-стилей), то изолировать CSS и применить пространство имен к подключаемой разметке
- иначе, если у `<b:include>` используется атрибут `isolate`, то [изолировать по тем же правилам](#Изоляция-стилей), что и остальная разметка

Стиль вставляется в конец списка стилей подключаемого шаблона.

### &lt;b:before>

Cодержимое этого тега вставляется перед узлом с указанной ссылкой. Атрибут `ref` должен содержать название ссылки на узел, а если такого атрибута нет или в подключаемом описании нет узла с такой ссылкой, то данный тег игнорируется.

```html
<b:include src="./foo.tmpl">
  <b:before ref="label">
    [inserted content]
  </b:before>
</b:inclide>
```

foo.tmpl:

```html
<div class="example">
  <span{label}>{title}</span>
</div>
```

Результат:

```html
<div class="example">
  [inserted content]
  <span{label}>{title}</span>
</div>
```

### &lt;b:after>

Работает так же как и `<b:before>`, но вставка происходит после указанного узла.

```html
<b:include src="./foo.tmpl">
  <b:after ref="label">
    [inserted content]
  </b:after>
</b:inclide>
```

foo.tmpl:

```html
<div class="example">
  <span{label}>{title}</span>
</div>
```

Результат:

```html
<div class="example">
  <span{label}>{title}</span>
  [inserted content]
</div>
```

### &lt;b:prepend>

Инструкци вставляет содержимое в начало элемента с указаной в атрибуте `ref` ссылкой. Если атрибут отсутствует, то используется ссылка `element`. Если узла с указанной ссылкой нет или узел не является элементом, то тег игнорируется.

```html
<b:include src="./foo.tmpl">
  <b:prepend ref="label">
    [inserted content]
  </b:prepend>
</b:inclide>
```

foo.tmpl:

```html
<div class="example">
  <span{label}>{title}</span>
</div>
```

Результат:

```html
<div class="example">
  <span{label}>[inserted content]{title}</span>
</div>
```

### &lt;b:append>

Работает так же, как и `<b:prepend>`, но вставляет содержимое в конец элемента.

```html
<b:include src="./foo.tmpl">
  <b:append ref="label">
    [inserted content]
  </b:append>
</b:inclide>
```

foo.tmpl:

```html
<div class="example">
  <span{label}>{title}</span>
</div>
```

Результат:

```html
<div class="example">
  <span{label}>{title}[inserted content]</span>
</div>
```

### &lt;b:replace>

Инструкция заменяет содержимым узел с указаной в атрибуте `ref` ссылкой. Если атрибут отсутствует, то используется ссылка `element`. Если узла с указанной ссылкой нет или узел не является элементом, то тег игнорируется.

```html
<b:include src="./foo.tmpl">
  <b:replace ref="label">
    [new content]
  </b:replace>
</b:inclide>
```

foo.tmpl:

```html
<div class="example">
  <span{label}>{title}</span>
</div>
```

Результат:

```html
<div class="example">
  [new content]
</div>
```

### &lt;b:remove>

Инструкция заменяет содержимым узел с указаной в атрибуте `ref` ссылкой. Если атрибут отсутствует, то используется ссылка `element`. Если узла с указанной ссылкой нет или узел не является элементом, то тег игнорируется.

```html
<b:include src="foo.tmpl">
  <b:remove ref="label"/>
</b:inclide>
```

foo.tmpl:

```html
<div class="example">
  <span{label}>{title}</span>
  <span>{value}</span>
</div>
```

Результат:

```html
<div class="example">
  <span>{value}</span>
</div>
```

### &lt;b:attr>, &lt;b:set-attr>

Уставливает атрибут с именем `name` и значением `value` элементу с ссылкой `ref`.

```html
<b:include src="./foo.tmpl">
  <b:attr ref="label" name="foo" value="bar"/>
</b:inclide>
```

foo.tmpl:

```html
<div class="example">
  <span{label}>{title}</span>
</div>
```

Результат:

```html
<div class="example">
  <span{label} foo="bar">{title}</span>
</div>
```

### &lt;b:append-attr>

Добавляет значение к значению атрибута.

```html
<b:include src="./foo.tmpl">
  <b:append-attr ref="label" name="foo" value="def"/>
  <b:append-attr ref="label" name="bar" value="baz"/>
</b:inclide>
```

foo.tmpl:

```html
<div class="example">
  <span{label} foo="abc">{title}</span>
</div>
```

Результат:

```html
<div class="example">
  <span{label} foo="abcdef" bar="baz">{title}</span>
</div>
```

### &lt;b:remove-attr>

Удаляет атрибут.

```html
<b:include src="./foo.tmpl">
  <b:remove-attr ref="label" name="foo"/>
</b:inclide>
```

foo.tmpl:

```html
<div class="example">
  <span{label} foo="abc">{title}</span>
</div>
```

Результат:

```html
<div class="example">
  <span{label}>{title}</span>
</div>
```

### &lt;b:class>, &lt;b:append-class>

Добавляет класс (классы) в атрибут `class`.

```html
<b:include src="./foo.tmpl">
  <b:class ref="label" value="foo foo_{selected}"/>
</b:inclide>
```

foo.tmpl:

```html
<div class="example">
  <span{label} class="bar">{title}</span>
</div>
```

Результат:

```html
<div class="example">
  <span{label} class="bar foo foo_{selected}">{title}</span>
</div>
```

### &lt;b:set-class>

Замещает значение атрибута `class` на новое.

```html
<b:include src="./foo.tmpl">
  <b:set-class ref="label" value="foo foo_{selected}"/>
</b:inclide>
```

foo.tmpl:

```html
<div class="example">
  <span{label} class="bar">{title}</span>
</div>
```

Результат:

```html
<div class="example">
  <span{label} class="foo foo_{selected}">{title}</span>
</div>
```

### &lt;b:remove-class>

Удаляет указанные в атрибуте `value` имена классов из атрибута `class` заданного элемента. Каждое имя обрабатывается отдельно, поэтому их порядок не важен.

```html
<b:include src="./foo.tmpl">
  <b:remove-class ref="label" value="foo foo_{selected}"/>
</b:inclide>
```

foo.tmpl:

```html
<div class="example">
  <span{label} class="foo_{selected} bar foo">{title}</span>
</div>
```

Результат:

```html
<div class="example">
  <span{label} class="bar">{title}</span>
</div>
```

### &lt;b:add-ref>

Добавляет дополнительную ссылку узлу разметки.

```html
<b:include src="./foo.tmpl">
  <b:add-ref name="demo"/>
  <b:add-ref ref="foo" name="bar"/>
</b:inclide>
```

foo.tmpl:

```html
<div class="example">
  <span{foo}/>
</div>
```

Эквивалентно:

```html
<div{demo} class="example">
  <span{foo|bar}/>
</div>
```

### &lt;b:remove-ref>

Добавляет дополнительную ссылку узлу разметки.

```html
<b:include src="./foo.tmpl">
  <b:remove-ref name="demo"/>
  <b:remove-ref name="bar"/>
</b:inclide>
```

foo.tmpl:

```html
<div{demo} class="example">
  <span{foo|bar}/>
</div>
```

Эквивалентно:

```html
<div class="example">
  <span{foo}/>
</div>
```

> Нет необходимости удалять ссылку `element`, так как она всегда удаляется из подключаемой разметки.

### &lt;b:role>, &lt;b:set-role>

Устанавливает маркет роли на элемент. Подробнее в [Роли](role.md)

```html
<b:include src="./foo.tmpl">
  <b:set-role/>
  <b:set-role ref="label" name="count"/>
</b:inclide>
```

foo.tmpl:

```html
<div class="example">
  <span{label}/>
</div>
```

Эквивалентно:

```html
<div class="example" b:role>
  <span{label} b:role="count"/>
</div>
```

> В старых версиях basis.js вместо атрибута `name` использовался атрибут `value`.

### &lt;b:remove-role>

Удаляет маркет роли с элемента. Подробнее в [Роли](role.md)

```html
<b:include src="./foo.tmpl">
  <b:remove-role/>
  <b:remove-role ref="label"/>
</b:inclide>
```

foo.tmpl:

```html
<div class="example" b:role>
  <span{label} b:role="something"/>
</div>
```

Эквивалентно:

```html
<div class="example">
  <span{label}/>
</div>
```

### &lt;b:show>, &lt;b:hide>, &lt;b:visible>, &lt;b:hidden>

Устанавливает соответствующий атрибут заданному элементу.

```html
<b:include src="./foo.tmpl">
  <b:show expr="{expr1}"/>
  <b:hide ref="a" expr="{expr2}"/>
  <b:visible ref="b" expr="{expr3}"/>
  <b:hidden ref="c" expr="{expr4}"/>
</b:inclide>
```

foo.tmpl:

```html
<div class="example" b:hide="{something}">
  <span{a}/>
  <span{b}/>
  <span{c}/>
</div>
```

Эквивалентно:

```html
<div class="example" b:show="{expr1}">
  <span{a} b:hide="{expr2}"/>
  <span{b} b:visible="{expr3}"/>
  <span{c} b:hidden="{expr4}"/>
</div>
```

Нужно заметить, что `b:hide` в `foo.tmpl` был отброшен, так как `b:show` и `b:hide` (как и `b:visible`/`b:hidden`) взаимообратные и выигрывает последний.

Подробнее про специальные атрибуты в [Специальные атрибуты в шаблонах](attribute.md)
