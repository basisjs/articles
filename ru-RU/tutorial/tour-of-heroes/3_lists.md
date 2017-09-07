 # Lists

В этой части мы научимся как правильно выводить списки.

Для начала давайте вытащим всю логику связанную с отображением и редактированием героя из прошлого урока в отдельный компонент.
Этот код нам понадобиться позже, но сейчас он отвлекает нас от текущей темы.

В папке `app` создадим директорию `components` куда будем складывать наши компоненты, и там создадим папку hero-details в которую положим уже ранее созданный в `app.js` компонент с редактированием героя.

`app/components/hero-details/hero-details.js`:
```js
var Node = require('basis.ui').Node;

var HeroDetailsNode = new Node({
    template: resource('./templates/hero-details.tmpl'),
    data: {
        id: 1,
        title: 'Superhero'
    },
    binding: {
        id: 'data:',
        title: 'data:',
    },
    action: {
        setHeroName: function (e) {
            this.update({
                hero: {
                    id: this.data.hero.id,
                    title: e.sender.value
                }
            });
        }
    }
});

module.exports = HeroDetailsNode;
```

`app/components/hero-details/templates/hero-details.tmpl`:
```html
<div>
  <h2>{title} is a hero!</h2>
  <div><label>Id: </label>{id}</div>
  <div>
    <label>title: </label>
    <input value="{title}" event-input="setHeroName" placeholder="Enter name">
  </div>
</div>
```

А теперь поменяем наш главный шаблон `layout.tmpl`:

`layout.tmpl`:
```html
<ul class="heroes"></ul>
```

Каждый `<li>` котоырй мы будем помещать в наш список должен быть описан как отдельный компонент, поэтому давайте создадим его и заодно научимся подключать стили в basis.

`app/components/hero/index.js`
```js
var Node = require('basis.ui').Node;

module.exports = Node.subclass({
    template: resource('./templates/hero.tmpl'),
    binding: {
        id: 'id',
        title: 'title',
    }
});
```

Для вставки внешних стилей в шаблоны зарезервирован специальный тэг `<b:style src="pathToStyles"/>` где `pathToStyles` соответственно путь до файла. Это не обязатенльно внешний файл - можно указать стили и между парой тегов:

```css
<b:style>
  .demo { color: red; }
</b:style>
```

Так же существует дополнительная инструкция `<b:isolate/>`указание который делает все стили примененные к данному компоненту уникальными что предотвращает конфликт имен, т.к. все стили по сути будут инкапсулированы относительно компонента. Итак, добавим все это в наш шаблон будущих `<li>`!

`app/components/hero/templates/hero.tmpl`
```html
<b:style src="./hero.css"/>
<b:isolate/>

<li>
  <span class="badge">{id}</span> {title}
</li>
```

А теперь просто скопируйте нижележащие стили в css файл который вы подключили.

`app/components/hero/templates/hero.css`
```css
li {
  cursor: pointer;
  position: relative;
  left: 0;
  background-color: #EEE;
  margin: .5em;
  padding: .3em 0;
  height: 1.6em;
  border-radius: 4px;
}
li.selected:hover {
  background-color: #BBD8DC !important;
  color: white;
}
li:hover {
  color: #607D8B;
  background-color: #DDD;
  left: .1em;
}
.text {
  position: relative;
  top: -3px;
}
.badge {
  display: inline-block;
  font-size: small;
  color: white;
  padding: 0.8em 0.7em 0 0.7em;
  background-color: #607D8B;
  line-height: 1em;
  position: relative;
  left: -1px;
  top: -4px;
  height: 1.8em;
  margin-right: .8em;
  border-radius: 4px 0 0 4px;
}
```

Остались две задача для

1) Создание `<li>` как дочерних узлов `<ul>`
2) Использование `HeroNode` при создании дочерних узлов

Данные мы будем передвать через свойство `childNodes` класса `basis.ui.node`. В `childNodes` передается массив объектов, которые используются как конфиги для построения заданных компонентов.

Задать какие именно компоненты будут строиться как дочерние узлы из переданных объектов-конфигов можно при помощи свойства `childClass`, передав ему в качестве значения необходимый компонент. В нашем случае это недавно созданный hero компонент в `app/components/hero/index.js`.

В итоге если задать оба свойства, то наш `app.js` будет выглядеть следующим образом:

`app.js`:
```js
var Node = require('basis.ui').Node;
var Hero = require('./app/components/hero/index');

module.exports = require('basis.app').create({
    title: 'Basis tour of heroes',
    init: function () {
        return new Node({
            template: resource('./app/template/layout.tmpl'),
            childClass: Hero,
            childNodes: [
                { id: 1, title: 'Headcrab' },
                { id: 2, title: 'Magnetto' },
                { id: 3, title: 'Cyclop' },
                { id: 4, title: 'Batman' },
                { id: 5, title: 'Superman' },
                { id: 6, title: 'Storm' },
                { id: 7, title: 'Flash' },
                { id: 8, title: 'Wolverine' }
            ]
        });
    }
});
```

Более гибко построение дочерних элементов можно через свойство `childFactory`. Подробнее об этом можно почитать [тут](https://github.com/basisjs/articles/blob/master/ru-RU/tutorial/part1/index.md#Список).

Давайте добавим еще немного стилей:

`src/app/template/layout.css`
```css
HTML,
BODY
{
  height: 100%;
  padding: 0;
  margin: 0;

  background: white;
  color: black;
}

.selected {
  background-color: #CFD8DC !important;
  color: white;
}
.heroes {
  margin: 0 0 2em 0;
  list-style-type: none;
  padding: 0;
  width: 15em;
}
```

По умолчаню `childNodes` добавляются к корневому элементу шаблона,
но это далеко не всегда удобно, т.к. зачастую есть другая дополнительная разметка которую отображать помимо списка. Поэтому в шаблонах Basis можно напрямую указать тэг в который будут отображаться `childClass` элементы указав на тэге `childNodesElement` свойство следующим образом:

`layout.tmpl`:
```html
<b:style src="./layout.css"/>

<div>
  <h1>Tour of heroes</h1>
  <ul{childNodesElement} class="heroes" />
</div>
```

Или можно использовать `<!--{childNodesHere}-->` внутри самих тегов:

`layout.tmpl`:
```html
<b:style src="./layout.css"/>

<div>
  <h1>Tour of heroes</h1>
  <ul id="heroes-list" class="heroes">
    <!--{childNodesHere}-->
  </ul>
</div>
```

__Обязательно должен быть корневвой элемент!__ Иначе basis не сможет построить шаблон правильно. Это касается любых шаблонов.

Вот теперь наш список героев готов!

Полный пример урока можете скачать по [ссылке](https://github.com/prostoandrei/basis-tour-of-heroes/tree/part3)

В следующем уроке мы научиммся более эффективно разбивать и располагать компоненты и обсдуим важную тему сателлитов.



