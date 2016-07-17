# &lt;b:isolate&gt;

Включает [изоляцию](isolate-style.md). В шаблонах с тегом `<b:isolate/>`, каждому используемому классу разметки, будет добавлен префикс. Для каждого компонента префикс будет сгенерирован случайным образом.

`template.tmpl`:
```html
<b:style>
  .some-class {
    color: red;
  }
</b:style>
<b:isolate/>

<div class="some-class">Компонент</div>
```

В результате будет сгененировано следующее содержимое:

```html
<div class="i1__some-class">Компонент</div>
```

```css
.i1__some-class {
  color: red;
}
```

Указав атрибут `prefix`, можно задать собственный префикс для изоляции:

```html
<b:style>
  .some-class {
    color: red;
  }
</b:style>
<b:isolate prefix="my-prefix_"/>

<div class="some-class">Компонент</div>
```

В результате будет сгенерировано:

```html
<div class="my-prefix_some-class">Компонент</div>
```

```css
.my-prefix_some-class {
  color: red;
}
```
