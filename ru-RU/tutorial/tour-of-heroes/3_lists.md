# Списки и дочерние элементы

В этой части мы научимся как правильно выводить списки.

Для начала давайте вытащим всю логику, связанную с отображением и редактированием героя из прошлого урока в отдельный компонент.
Этот код нам понадобиться позже, но сейчас он отвлекает нас от текущей темы.

В папке `app` создадим директорию `components` куда будем складывать наши компоненты, и там создадим папку `hero-details` в которую положим уже ранее созданный в `app.js` компонент с редактированием героя.

`app/components/hero-details/index.js`:
```js
var Node = require('basis.ui').Node;

var heroDetailsNode = new Node({
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

module.exports = heroDetailsNode;
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

Каждый `<li>` который мы будем помещать в наш список должен быть описан как отдельный компонент, поэтому давайте создадим его и заодно научимся подключать стили в `basis.js`.

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

Для вставки внешних стилей в шаблоны зарезервирован специальный тэг `<b:style src="pathToStyles"/>` где `pathToStyles` соответственно путь до файла. Это не обязательно внешний файл - можно указать стили и между парой тегов:

```css
<b:style>
  .demo { color: red; }
</b:style>
```

Так же существует дополнительная инструкция `<b:isolate/>`указание который делает все стили примененные к данному компоненту уникальными, что предотвращает конфликт имен, т.к. все стили по сути будут инкапсулированы относительно компонента. Итак, добавим все это в наш шаблон будущих `<li>`!

`app/components/hero/templates/hero.tmpl`
```html
<b:style src="./hero.css"/>
<b:isolate/>

<li>
  <span class="badge">{id}</span> <span class="title">{title}</span>
</li>
```

А теперь просто скопируйте нижележащие стили в css файл который вы подключили.

`app/components/hero/templates/hero.css`
```css
li {
  cursor: pointer;
  position: relative;
  background-color: #da9b85;
  margin: 8px 0;
  color: white;
  height: 1.6em;
  border-radius: 4px;
  display: table;
  width: 100%;
}
li.selected:hover {
  background-color: #c37c5e;
  color: white;
}
li:hover {
  color: white;
  background-color: #c37c5e;
  left: .1em;
}
.text {
  position: relative;
  top: -3px;
}
.badge {
  font-size: small;
  color: white;
  text-align: center;
  background-color: #587e74;
  line-height: 1em;
  position: relative;
  margin-right: .8em;
  border-radius: 4px 0 0 4px;
  width:25px;
  vertical-align: middle;
  display: table-cell;
}
.title {
  vertical-align: middle;
  padding-left: 5px;
  display: table-cell;
  font-weight: bold;
}

.selected {
  background-color: #c37c5e;
  color: white;
}
```

Остались две задача для

1) Создание `<li>` как дочерних узлов `<ul>`
2) Использование `HeroNode` при создании дочерних узлов

Данные мы будем передавать через свойство `childNodes` класса `basis.ui.node`. В `childNodes` передается массив объектов, которые используются как конфиги для построения заданных компонентов.

Задать какие именно компоненты будут строиться как дочерние узлы из переданных объектов-конфигов можно при помощи свойства `childClass`, передав ему в качестве значения необходимый компонент. В нашем случае это недавно созданный `hero` компонент в `app/components/hero/index.js`.

В итоге если задать оба свойства, то наш `app.js` будет выглядеть следующим образом:

`app.js`:
```js
var Node = require('basis.ui').Node;
var hero = require('./app/components/hero/index');

module.exports = require('basis.app').create({
    title: 'Basis tour of heroes',
    init: function () {
        return new Node({
            template: resource('./app/template/layout.tmpl'),
            childClass: hero,
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

Более гибко настроить построение дочерних элементов можно через свойство `childFactory`. Подробнее об этом можно почитать [тут](https://github.com/basisjs/articles/blob/master/ru-RU/tutorial/part1/index.md#Список).

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

.heroes {
  margin: 0 0 2em 0;
  list-style-type: none;
  padding: 0;
  width: 15em;
}
```

По умолчанию, `childNodes` добавляются к корневому элементу шаблона, но это далеко не всегда удобно, т.к. зачастую есть другая дополнительная разметка, которую отображать помимо списка. Поэтому в шаблонах `basis.js` можно напрямую указать тэг, в который будут отображаться `childClass` элементы указав на тэге `childNodesElement` свойство следующим образом:

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

Во всех шаблонах __обязательно должен быть корневой элемент!__ Иначе `basis.js` не сможет построить шаблон правильно. Это касается любых шаблонов.

Вот теперь наш список героев готов!

Полный пример урока можете скачать по [ссылке](https://github.com/prostoandrei/basis-tour-of-heroes/tree/part3)

В следующем уроке мы научимся более эффективно разбивать и располагать компоненты и обсудим важную тему сателлитов.



