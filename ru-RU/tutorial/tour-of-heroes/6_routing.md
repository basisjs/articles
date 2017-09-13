# Basis router

Если [посмотреть](http://basisjs.com/) на главную страницу `Basis.js`, то вы увидите что Basis это "JavaScript framework to build Single Page Applications". Невозможно представить фреймворк с подобным лозунгом без предоставляемого роутера и в этой главе мы добавим роутинг в наше приложение.

В приложении для начала сделаем два дополнительных роута:

* dashbaord - будет выводить первых 4 героя
* heroes - будет выводить всех героев

Для дальнейших действий нам нужно реорганизовать наше приложение. Сделаем отдельный файл которые который будет хранить ссылки на все наши компоненты страниц и соотвественно выделим эти компоненты страниц. К счастью компоненты страниц у нас почти готовы.

Создадим папку `pages` в нашем приложении в котором будут лежать все страницы нашего приложения и там создадим файл хранящий все страницы.


`/app/pages/index.js`
```js
var Heroes = require('./heroes/index');

module.exports = {
    '': Heroes,
    'heroes': Heroes
}
```

Здесь ключ `''` это роут по умолчанию, когда ни одна страница не выбрана. `Heroes` роут в  строке браузера будет выглядет так `http://localhost:8001/#heroes`.

Сейчас нужно реализовать Heroes компонент. Просто перенесем то что у нас было до этого в `app.js` в page `Heroes`

`app/pages/heroes/index.js`
```js
var Node = require('basis.ui').Node;
var List = require('../../components/hero-list/index');
var Details = require('../../components/hero-details/index');

List.selection.addHandler({
    itemsChanged: function(sender) {
        Details.setDelegate(sender.pick());
    }
});

module.exports = new Node({
    template: resource('./templates/heroes.tmpl'),
    binding: {
        list: List,
        details: Details
    }
});
```

`app/pages/heroes/templates/heroes.tmpl`
```html
<div>
  <!--{list}-->
  <!--{details}-->
</div>
```

Соответсвенно в `app.js` мы будем использовать наши страницы как сателлиты

Теперь давайте измениим `app.js`:

`app.js`
```js
var Node = require('basis.ui').Node;

var pages = require('./app/pages/index');

module.exports = require('basis.app').create({
    title: 'Basis tour of heroes',
    init: function () {
        return new Node({
            template: resource('./app/template/layout.tmpl'),
            binding: {
                content: pages.heroes
            },
        });
    }
});
```

Отлично! Теперь нам необходимо научиться пользоваться роутером чтобы динамичкески переключать `Pages` из `app/pages/index`. Вся суть роутинга как раз и будет заключаться в изменении значения сателлита `content`.

Импортируем `basis.router` в наше приложение.
Экземпляр роутера обладает методом `.route` который позволяет добавить путь который необходимо отслеживать. Путь может быть строкой или регулярным выражением. В случае если задана строка, то она трансформируется в регулярное выражение по спец. правилам о которых очень рекомендуем прочитать в [документации](https://github.com/basisjs/articles/blob/master/ru-RU/basis.router.md#path)

В общем случае сконигурировать роут достаточно просто. Например роут в нашем случае достачно кода приведенного ниже:

```js
var page = router
    .route(':page')
    .param('page')
    .as(function(page) {
        return pages[page] || pages[''];
    });
```

Т.е. в роуте со схемой `:page` мы ищем параметр `page` и далее возвращаем его через метод `.as` роутера. Значение переменной `page` является реактивным и будет изменяться при изменении роута.

__Замечание:__

> Значение сателлита будет изменяться динамически через роутер только в том случае, если сателлит указан явным образом, т.е. через свойтсво `satellite`. Если указывать сателлит неявно, то изменение value роутера обработано не будет, поэтмому убедитесь, что сателлит указан явно

`app.js`
```js
var Node = require('basis.ui').Node;
var router = basis.require('basis.router');
var pages = require('./app/pages/index');

var page = router
    .route(':page')
    .param('page')
    .as(function(page) {
        return pages[page] || pages[''];
    });

module.exports = require('basis.app').create({
    title: 'Basis tour of heroes',
    init: function () {
        return new Node({
            template: resource('./app/template/layout.tmpl'),
            binding: {
                content: 'satellite:'
            },
            satellite: {
                content: page
            },
        });
    }
});

router.start();
```

Не забудьте в конце вызвать `router.start()` чтобы роутер начал отслеживать изменения.

Перед тем как создавать второй компонент давайте вынесем данные с героями в отдельный файл чтобы использовать их между нащими компонентами:

`app/mockData/heroes.js`
```js
var DataObject = require('basis.data').Object;
var Dataset = require('basis.data').Dataset;

var heroesDataset = new Dataset({
    items: [
        { id: 1, title: 'Headcrab' },
        { id: 2, title: 'Magnetto' },
        { id: 3, title: 'Cyclop' },
        { id: 4, title: 'Batman' },
        { id: 5, title: 'Superman' },
        { id: 6, title: 'Storm' },
        { id: 7, title: 'Flash' },
        { id: 8, title: 'Wolverine' }
    ].map(function (value) {
        return new DataObject({
            data: {
                id: value.id,
                title: value.title
            }
        });
    })
});

module.exports = heroesDataset;
```

Соответсвенно необходимо изменить `hero-list` чтобы теперь он теперь получал данные файла с данными, а не создавал их внутри себя. Заодно и выглядеть это будет сильно лучше чем было.

`app/components/hero-list/index.js`
```js
var Node = require('basis.ui').Node;
var Hero = require('../hero/index');
var dataset = require('../../mockData/heroes');

module.exports = new Node({
    template: resource('./templates/hero-list.tmpl'),
    childClass: Hero,
    selection: true,
    dataSource: dataset
});
```

Теперь давайте создадим наш Dashboard компонент:

`app/pages/dashboard/index.js`
```js
var Node = require('basis.ui').Node;
var DataObject = require('basis.data').Object;
var dataset = require('../../mockData/heroes');

module.exports = new Node({
    template: resource('./templates/dashboard.tmpl'),
    childClass: {
        template: `
            <a class="col-1-4">
                <div class="module hero">
                    <h4>{title}</h4>
                </div>
            </a>
        `,
        binding: {
            id: 'data:',
            title: 'data:',
        },
    },
    dataSource: dataset
});
```

`app/pages/dashboard/templates/dashboard.css`
```html
<b:style src="./dashboard.css"/>

<div>
  <h3>Top Heroes</h3>
  <div class="grid grid-pad">
    <!--{childNodesHere}-->
  </div>
</div>
```

`app/pages/dashboard/templates/dashboard.css`
```css
[class*='col-'] {
  float: left;
  padding-right: 20px;
  padding-bottom: 20px;
}
[class*='col-']:last-of-type {
  padding-right: 0;
}
a {
  text-decoration: none;
}
*, *:after, *:before {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}
h3 {
  text-align: center; margin-bottom: 0;
}
h4 {
  position: relative;
}
.grid {
  margin: 0;
}
.col-1-4 {
  width: 25%;
}
.module {
  padding: 20px;
  text-align: center;
  color: #eee;
  max-height: 120px;
  min-width: 120px;
  background-color: #607D8B;
  border-radius: 2px;
}
.module:hover {
  background-color: #EEE;
  cursor: pointer;
  color: #607d8b;
}
.grid-pad {
  padding: 10px 0;
}
.grid-pad > [class*='col-']:last-of-type {
  padding-right: 20px;
}
@media (max-width: 600px) {
  .module {
    font-size: 10px;
    max-height: 75px; }
}
@media (max-width: 1024px) {
  .grid {
    margin: 0;
  }
  .module {
    min-width: 60px;
  }
}
```

Если вы сейчас будете менять роуты в строке браузера, то все будет работать. Но в настоящий приложениях существует навигация, поэтому давайте добавим компонент навигации в наше приложение.

`app/components/navigation/index.js`
```js
var Node = require('basis.ui').Node;
var router = basis.require('basis.router');

module.exports = new Node({
    template: resource('./templates/navigation.html'),
    childClass: {
        template: `
            <a href="{link}" event-click="navigate">{title}</a>
        `,
        binding: {
            title: 'title',
            link: 'link'
        },
        action: {
            navigate: function(e) {
                e.preventDefault();
                router.navigate(this.link);
            }
        }
    },
    childNodes: [
        { title: 'Dashboard', link: '#dashboard' },
        { title: 'Heroes', link: '#heroes' }
    ]
});
```

`app/components/navigation/templates/navigation.html`
```html
<b:style src="./navigation.css"/>

<nav></nav>
```

`app/components/navigation/templates/navigation.css`
```css

nav a {
  padding: 5px 10px;
  text-decoration: none;
  margin-top: 10px;
  display: inline-block;
  background-color: #eee;
  border-radius: 4px;
}
nav a:visited, a:link {
  color: #607D8B;
}
nav a:hover {
  color: #039be5;
  background-color: #CFD8DC;
}
nav a.active {
  color: #039be5;
}
```

Теперь сателлитом подклюим компонент навигации в наше приложение:

`app.js`
```js
// ...
var pages = require('./app/pages/index');
var Navigation = require('./app/components/navigation/index');
// ...
    binding: {
        navigation: 'satellite:',
        content: 'satellite:'
    },
    satellite: {
        navigation: Navigation,
        content: page
    },
// ...
```

`app/template/layout.tmpl`
```html
 <b:style src="./layout.css"/>

<div>
  <h1>Tour of heroes</h1>
  <!--{navigation}-->
  <!--{content}-->
</div>
```

Теперь у нас есть два полноценных роута с нашими компонентамию. Можете считать что вы написали первое SPA на `basis.js`!
