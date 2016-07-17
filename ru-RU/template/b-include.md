# &lt;b:include&gt;

`<b:include>` используется для включения в описание шаблона другого описания (шаблона).

Для тега можно указать следующие атрибуты:

  * `src` – ссылка на подключаемое описание, это может быть:

      * путь к файлу; относительные пути (начинаются не с `/`) разрешаются относительно файла шаблона или относительно корня приложения, если описание находится не в отдельном файле;

        ```html
          <b:include src="./path/to/file.tmpl"/>
        ```

      * имя шаблона определенное с помощью `basis.template.define` (подробнее ["Темы"](basis.template_theme.md))

        ```html
          <b:include src="foo.bar.baz"/>
        ```

      * ссылка вида `#N`, где `N` - идентификатор шаблона (значение свойства `templateId`); в основном используется внутренними механизмами.

        ```html
          <b:include src="#123"/>
        ```

      * ссылка вида `id:name`, где `name` - значение атрибута `id` у тега `<script type="text/basis-template">`. Если элемент успешно найден в документе, то для описания шаблона используется его содержимое.

        ```html
          <b:include src="id:my-template"/>
        ```

  * `no-style` – включается только разметка, все стили игнорируется.
  * `isolate` – указывает, что стили и разметку нужно [изолировать](isolate-style.md) перед включением; в качестве значения указывается префикс, который подставляется всем класса, а если атрибут не имеет значения, то генерируется случайный; подробнее в [Изоляция стилей](isolate-style.md)
  * `role` – позволяет задать пространство имен для ролей в подключаемой разметке; подробнее в [Роли](role.md)
  * `id` → `<b:set-attr name="id" value="(значение атрибута)">`
  * `class` → `<b:append-class value="(значение атрибута)">`
  * `ref` → `<b:add-ref name="(значение атрибута)">`
  * `show` → `<b:show expr="(значение атрибута)">`
  * `hide` → `<b:hide expr="(значение атрибута)">`
  * `visible` → `<b:visible expr="(значение атрибута)">`
  * `hidden` → `<b:hidden expr="(значение атрибута)">`

Исходный шаблон:

```html
<b:include src="./foo.tmpl" id="foo" class="extra-class with_{binding}"/>
```

foo.tmpl:

```html
<div class="example"/>
```

Результат:

```html
<div id="foo" class="example extra-class with_{binding}"/>
```

Внутри `<b:include>` могут быть другие специальные теги-инструкции, предназначенные для модификации подключаемого описания:

* [`<b:before>`](#bbefore) – вставлка до узла
* [`<b:after>`](#bafter) – вставка после узла
* [`<b:prepend>`](#bprepend) – вставка в начало элемента
* [`<b:append>`](#bappend) – вставка в конец элемента
* [`<b:replace>`](#breplace) – замена узела
* [`<b:remove>`](#bremove) – удаление узла
* [`<b:attr>`](#battr-bset-attr), [`<b:set-attr>`](#battr-bset-attr) – установка атрибута
* [`<b:append-attr>`](#bappend-attr) – добавление значения к значению атрибута
* [`<b:remove-attr>`](#bremove-attr) – удаление атрибута
* [`<b:class>`](#bclass-bappend-class), [`<b:append-class>`](#bclass-bappend-class) – добавление класса (классов) в атрибут `class`;
* [`<b:set-class>`](#bset-class) – замещение значения атрибута `class`
* [`<b:add-ref>`](#badd-ref) – добавление [ссылки](basis.template_format.md#Ссылки) на узел
* [`<b:remove-ref>`](#bremove-ref) – удаление [ссылки](basis.template_format.md#Ссылки) на узел
* [`<b:role>`](#brole-set-role), [`<b:set-role>`](#brole-set-role) – установка маркера роли
* [`<b:remove-role>`](#bremove-role) – удаление маркера роли
* [`<b:show>`](#bshow-bhide-bvisible-bhidden), [`<b:hide>`](#bshow-bhide-bvisible-bhidden), [`<b:visible>`](#bshow-bhide-bvisible-bhidden), [`<b:hidden>`](#bshow-bhide-bvisible-bhidden) – установление соотвествующего специального атрибута на элемент

## &lt;b:before>

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

## &lt;b:after>

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

## &lt;b:prepend>

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

## &lt;b:append>

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

## &lt;b:replace>

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

## &lt;b:remove>

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

## &lt;b:attr>, &lt;b:set-attr>

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

## &lt;b:append-attr>

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

## <b:remove-attr>

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

## &lt;b:class>, &lt;b:append-class>

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

## &lt;b:set-class>

Замещает значение атрибута `class` на новое значение;

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

## &lt;b:add-ref>

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

## &lt;b:remove-ref>

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

## &lt;b:role>, &lt;b:set-role>

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

## &lt;b:remove-role>

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

## &lt;b:show>, &lt;b:hide>, &lt;b:visible>, &lt;b:hidden>

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

## Изоляция шаблона

Для [изоляции](isolate-style.md) подключаемого шаблона, в тег `<b:include/>` добавляется атрибут `isolate`:

`template.tmpl`:

```html
<b:style>
  .some-class {
    color: red;
  }
</b:style>

<div>
  <div class="some-class">Компонент</div>
  <b:include src="./innerTemplate.tmpl" isolate/>
</div>
```

`innerTemplate.tmpl`:

```html
<b:style>
  .gold-border {
    border: 1px solid gold;
  }
</b:style>

<div class="gold-border">Подключаемый шаблон</div>
```

В результате будет сгенерировано следующее содержимое:

```html
<div>
  <div class="some-class">Компонент</div>
  <div class="t234t23t2__gold-border">Подключаемый шаблон</div>
</div>
```

```css
.some-class {
  color: red;
}
.t234t23t2__gold-border {
  border: 1px solid gold;
}
```

Можно задать собственный префикс, указав значение атрибуту `isolate`:

`template.tmpl`:

```html
...
<b:include src="./innerTemplate.tmpl" isolate="my-prefix_"/>
...
```

В результате будет сгенерировано следующее содержимое:

```html
<div>
  <div class="some-class">Компонент</div>
  <div class="my-prefix_gold-border">Подключаемый шаблон</div>
</div>
```

```css
.some-class {
  color: red;
}
.my-prefix_gold-border {
  border: 1px solid gold;
}
```
