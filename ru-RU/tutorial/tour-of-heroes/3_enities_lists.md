 # Entities / List

В этой части мы научимся как правильно выводить списки героев.

В нашем приложении достаточно отчетливо прослеживается сущность героя, поэтому давайте выделим ее отдельно.

Для этого в Basis есть отдельный модуль `basis.entity` который предназначен для описания типизированных моделей данных.

В нашем случае создание сущности героя будет выглядеть следующим образом:

```js
var entity = require('basis.entity');

var Hero = entity.createType('Hero', {
  id: entity.IntId,
  title: String
});
```

В результате в `Hero` будет хранится функция которая по сути является фабрикой экземпляров и чтобы в дальнейшем заполнить нашу сущность данными нужно просто вызывать это функцию с передачей ей объекта со свойствами согласно объявленной сущности.

```js
Hero({ id: 1, title: 'Your title' });
```

Посмотреть все данные лежащие в сущности можно через свойство `all`.

```js
console.log(Hero.all)
```

Для детального ознакомления с `Entity` рекомендуем прочесть соответствющий раздел документации. ([ссылка](https://github.com/basisjs/articles/blob/master/ru-RU/basis.entity.md))

А теперь давайте вытащим всю логику связанные с отображением и редактированием отдельного героя из прошлого урока в отдельный компонент.
Этот код нам понадобиться позже, но сейчас он отвлекает нас от текущей темы.

В папке `app` создадим директорию `components` куда будем складывать наши компоненты, и там создадим папку hero-details в которую положим уже ранее созданный в `app.js` компонент с редактированием убрав лишнюю логику из него.

`app/components/hero-details/hero-details.js`:
```js
var Node = require('basis.ui').Node;

var HeroDetailsNode = new Node({
  template: resource('./app/template/layout.tmpl'),
  data: {
  id: 1,
  title: 'Superhero'
  },
  binding: {
  id: 'data:',
  title: 'data:',
  },
  action: {
  setHeroName: function(e) {
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
<h2>{title} is a hero!</h2>
<div><label>Id: </label>{id}</div>
<div>
  <label>title: </label>
  <input value="{title}"
    event-input="setHeroName"
    placeholder="Enter name"
  >
</div>
```

А `app.js` уже есть испортиваронные определение сущности нашего героя. Теперь нужно только наполнить сущность данным. Сейчас для простоты наполним её просто в обычном цикле:

```js
for (var i = 1; i <= 8; i++) {
  Hero({ id: i,	title: 'Title ' + i });
}
```

Изначально мы хотели создать список, поэтмоу поменяем наш главный шаблон `layout.tmpl`:

`layout.tmpl`:
```html
<ul class="heroes"></ul>
```

В этот список список мы будем рендерить наши `<li>`.

А теперь создадим в наших компонентах еще один одну директорию для HeroNode

`app/components/hero/hero.js`
```js
var Node = require('basis.ui').Node;

module.exports = Node.subclass({
  template:
  '<li>' +
    '<span class="badge">{id}</span> {title}' +
  '</li>',
  binding: {
    id: 'data:',
    title: 'data:',
  }
});
```

TODO - написать про SUBCLASS !!!

А теперь две самые вещи в отображении наших списков:

1) Использование нашей сущности как источник данных для списка
2) Использование `HeroNode` как класса для построения дочерних компонентов

Использовать нашу сущность как источник данных очень просто. Для этого просто нужно в нашей Node указать свойство `dataSource` и передать туда `Heroes.all`.

А для того чтобы задать для дочерних элементов класс `HeroNode` для той же ноды нужно указать свойство `childClass` и передать ему в качестве значения HeroNode.

В итоге наш `app.js` будет выглядеть следующим образом:

`app.js`:
```js
var Node = require('basis.ui').Node;
var Hero = require('./app/type').Hero;
var HeroNode = require('./app/components/hero/hero');

for (var i = 1; i <= 8; i++) {
  Hero({ id: i,	title: 'Title ' + i });
}

module.exports = require('basis.app').create({
  title: 'Basisjs tour of heroes',

  init: function() {
    return new Node({
      template: resource('./app/template/layout.tmpl'),
      childClass: HeroNode,
      dataSource: Hero.all
    });
  }
});
```

Нам также понадобятся стили чтобы приложение выглядело хорошо. Поэтому создайте файл layout.css и скопируйте туда приведенные ниже стили.

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
.heroes li {
  cursor: pointer;
  position: relative;
  left: 0;
  background-color: #EEE;
  margin: .5em;
  padding: .3em 0;
  height: 1.6em;
  border-radius: 4px;
}
.heroes li.selected:hover {
  background-color: #BBD8DC !important;
  color: white;
}
.heroes li:hover {
  color: #607D8B;
  background-color: #DDD;
  left: .1em;
}
.heroes .text {
  position: relative;
  top: -3px;
}
.heroes .badge {
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

Подключать стили в basis очень легко.
Просто добавьте специализированный тэг `<b:style src="pathToCss"/>` в целевой шаблон c путем до файла стилей.

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

Вот теперь наш список героев готов!

В [следующем уроке]() мы научиммся более эффективно разбивать и располагать компоненты и обсдуим важную тему сателлитов.



