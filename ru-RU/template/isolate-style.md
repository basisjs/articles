# Изоляция стилей

Изоляция стилей решает проблему конфликта имен CSS-классов в компонентах.

Первый компонент:

`component1/template.tmpl`:
```html
<b:style src="./style.css"/>

<div class="some-class">Компонент 1</div>
```

`component1/style.css`:
```css
.some-class {
  color: red;
}
```
Второй компонент:

`component2/template.tmpl`:
```html
<b:style src="./style.css"/>

<div class="some-class">Компонент 2</div>
```

`component2/style.css`:
```css
.some-class {
  color: green;
}
```
При размещении компонентов на странице, невозможно  предугадать порядок применения стилей. Это зависит от порядка подключения компонентов и от веса ([specificity](http://www.w3.org/TR/selectors/#specificity)) селекторов.
Изоляция позволяет использовать одинаковые имена классов в разметке разных компонентов, но гарантирует при этом отсутствие конфликтов в пределах всего приложения.

## Способы изоляции
### \<b:isolate/>
В шаблонах с тегом `<b:isolate/>`, каждому используемому классу разметки, будет добавлен префикс. Для каждого компонента префикс будет сгенерирован случайным образом.

`component1/template.tmpl`:
```html
<b:style src="./style.css"/>
<b:isolate/>

<div class="some-class">Компонент 1</div>
```
В результате будет сгененировано следующее содержимое:
```html
<div class="i1__some-class">Компонент 1</div>
```
```css
.i1__some-class {
    color: red;
}
```
> В шаблоне второго компонента изоляция не включена, поэтому имена классов внутри него не подверглись изменению.

Указав атрибут `prefix`, можно задать собственный префикс для изоляции шаблона:

`component1/template.tmpl`:
```html
<b:style src="./style.css"/>
<b:isolate prefix="my-prefix_"/>

<div class="some-class">Компонент 1</div>
```
В результате будет сгенерировано:
```html
<div class="my-prefix_some-class">Компонент 1</div>
```

#### namespace
С помощью атрибута `ns` (или `namespace`) можно изолировать подключаемый стиль. В качестве значения атрибута указывается имя пространства имен. В этом случае всем классам в файле стилей будет добавлен некоторый уникальный префикс.

Чтобы использовать имена классов из такого файла стилей, в атрибуте `class` необходимо предварять имена класов префиксом `namespace:`, где `namespace` - имя простраства имен (значение атрибута `ns`). В этом случае указанный префикс будет заменяться на уникальный префикс, назначеный для файла стилей.

Таким образом возможно избегать конфликта имен классов из разных файлов стилей.

```html
<b:style src="./style.css"/>
<b:style src="app:icons.css" ns="icon"/>
<b:style src="/bootstrap.css" ns="bt"/>

<div class="component bt:active active">
  <span class="icon:active bt:icon"/>
</div>
```

В данном примере `icon:active` будет использоваться из файла `app:icons.css`, `bt:active` и `bt:icon` из `/bootstrap.css`, а `active` из `style.css`. После обработки разметка будет иметь такой вид:

```html
<div class="component e3m9txir14yu5oq2__active active">
  <span class="m3yob6qh0fd0jwog__active e3m9txir14yu5oq2__icon"/>
</div>
```

> Префикс генерируется случайным образом. Вид имени класса может трансформироваться разным способом, в зависимости от настроек и окружения. Но способ преобразования одинаковый для файла стилей и для разметки.

Если для файла стилей используется атрибут `ns`, он изолируется единожды и используется для всех шаблонов. Другими словами, такой файл используется как библиотека для всех шаблонов. При этом значение атрибута `ns` не имеет значения, и используется лишь локально, для определения соотвествия в рамках описания шаблона.

Определенные в шаблоне пространства имен не применяются к описанию подключаемых шаблонов, как и не наследуются из подключаемых шаблонов. Если в префиксе имени класса указано не объявленное имя простраства имен (нет `<b:style>` с определенным значением атрибута `ns`), то такой класс удаляется из разметки.

Шаблон:
```html
<b:style src="./1.css" ns="foo">
<div class="foo:one bar:two">
  <b:include src="./2.tmpl"/>
</div>
```

`include.tmpl`
```html
<b:style src="./2.css" ns="bar">
<div class="foo:one bar:two"/>
```

Результирующая разметка:
```html
<div class="oeuj905r8en1wuvw__one">
  <div class="trisd0m91p24u6ck__two"></div>
</div>
```

#### Изоляция подключаемого шаблона
Если один шаблон подключается из другого, то изоляция автоматически распространаяется на подключаемый шаблон (даже если во включаемом шаблоне нет `<b:isolate/>`):

`component1/template.tmpl`:
```html
<b:style src="./style.css"/>
<b:isolate prefix="my-prefix_"/>

<div>
  <div class="some-class">Компонент 1</div>
  <b:include src="./innerTemplate.tmpl"/>
</div>
```
`component1/innerTemplate.tmpl`:
```html
<b:style src="./innerStyle.css"/>

<div class="some-class gold-border">Подключаемый шаблон</div>
```

`component1/innerStyle.css`:
```css
.gold-border {
  border: 1px solid gold;
}
```
В результате будет сгенерировано следующее содержимое:
```html
<div>
  <div class="my-prefix_some-class">Компонент 1</div>
  <div class="my-prefix_some-class my-prefix_gold-border">Подключаемый шаблон</div>
</div>
```
```css
.my-prefix_some-class {
    color: red;
}
.my-prefix_gold-border {
    border: 1px solid gold;
}
```

Бывают ситуации, когда не требуется изолировать весь шаблон компонента, а только подключаемый шаблон. В таких случаях, в `<b:include/>` добавляется атрибут `isolate`:

`component1/template.tmpl`:
```html
<b:style src="./style.css"/>

<div>
  <div class="some-class">Компонент 1</div>
  <b:include src="./innerTemplate.tmpl" isolate/>
</div>
```
`component1/innerTemplate.tmpl`:
```html
<b:style src="./innerStyle.css"/>

<div class="some-class gold-border">Подключаемый шаблон</div>
```
В результате будет сгенерировано следующее содержимое:
```html
<div>
  <div class="some-class">Компонент 1</div>
  <div class="t234t23t2__some-class t234t23t2__gold-border">Подключаемый шаблон</div>
</div>
```
Как видно из примера, был изолирован только подключаемый шаблон. Для того, чтобы указать собственный префикс для подключаемого шаблона, необходимо передать его в качестве значения для атрибута `isolate`:

`component1/template.tmpl`:
```html
<b:style src="./style.css"/>

<div>
  <div class="some-class">Компонент 1</div>
  <b:include src="./innerTemplate.tmpl" isolate="my-prefix_"/>
</div>
```
В результате будет сгенерировано следующее содержимое:
```html
<div>
  <div class="some-class">Компонент 1</div>
  <div class="my-prefix_some-class my-prefix_gold-border">Подключаемый шаблон</div>
</div>
```
