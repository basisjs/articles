# \<b:include>

`<b:include>` используется для включения в описание шаблона другого описания (шаблона).

Для тега можно указать следующие атрибуты:

  * `src` – ссылка на подключаемое описание, это может быть:

      * путь к файлу; если путь относительный (не начинается с `/`), то он разрешается относительно файла шаблона или относительно корня приложения, если описание находится не в отдельном файле;

        ```html
          <b:include src="./path/to/file.tmpl"/>
        ```

      * имя шаблона определенное с помощью `basis.template.define` (подробнее ["Темы"](basis.template_theme.md))

        ```html
          <b:include src="foo.bar.baz"/>
        ```

      * ссылка вида `#N`, где N - идентификатор шаблона (значение свойства `templateId`); в основном используется внутренними механизмами.

        ```html
          <b:include src="#123"/>
        ```

  * `id` → `<b:set-attr name="id" value="(значение атрибута)">`
  * `class` → `<b:append-class value="(значение атрибута)">`
  * `ref` → `<b:add-ref name="(значение атрибута)">`
  * `role` → `<b:set-role name="(значение атрибута)">`
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

## \<b:before>

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

## \<b:after>

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

## \<b:prepend>

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

## \<b:append>

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

## \<b:replace>

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

## \<b:remove>

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

## \<b:attr>, \<b:set-attr>

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

## \<b:append-attr>

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

## \<b:class>, \<b:append-class>

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

## \<b:set-class>

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

## \<b:add-ref>

## \<b:remove-ref>

## \<b:role>, \<b:set-role>

## \<b:remove-role>

## \<b:show>, \<b:hide>, \<b:visible>, \<b:hidden>

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
