# Basis router

Если [посмотреть](http://basisjs.com/) на главную страницу `basis.js`, то вы увидите лозунг "JavaScript framework to build Single Page Applications". Невозможно представить фреймворк с подобным лозунгом без предоставляемого роутера, и в этой главе мы добавим роутинг в наше приложение.

Сделаем два роута:

* heroes - будет выводить список всех героев
* dashboard - будет выводить первых 4 героев

Мы должны реорганизовать наше приложение. Сделаем отдельный файл, который будет хранить ссылки на все наши компоненты страниц. К счастью компоненты страниц почти готовы из предыдущих уроков.

Создадим папку `pages` в которой будут лежать все страницы нашего приложения и там создадим файл, хранящий все страницы.


`/app/pages/index.js`
```js
var Heroes = require('./heroes/index');

module.exports = {
    '': Heroes,
    'heroes': Heroes
}
```

Пока что добавим сюда только одну страницу.

Здесь ключ `''` это роут по умолчанию, когда ни одна страница не выбрана. т.е. просто `http://localhost:8001`. `Heroes` роут в строке браузера будет выглядит так `http://localhost:8001/#heroes`.

Сейчас роутер работает только со значением хеша адреса (location.hash). Поддержка History API планируется в будущих версиях.

Сейчас нужно реализовать `Heroes` компонент который мы передали выше. Перенесем то что у нас было до этого в `app.js` в page `Heroes`

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

В `app.js` мы будем использовать наши страницы как сателлиты, так что давайте изменим его:

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
            }
        });
    }
});
```

`app/template/layout.tmpl`
```html
<div class="wrapper">
    <div>
    <h1>Tour of heroes</h1>
    <!--{content}-->
    </div>
</div>
```

Отлично! У нас уже отображается страница по умолчанию, хоть мы и передали жесткую ссылку на компонент.

Теперь нам необходимо научиться пользоваться роутером, чтобы динамически переключать `Pages` из `app/pages/index`. Вся суть роутинга как раз и будет заключаться в изменении значения сателлита `content`.

Импортируем `basis.router` в наше приложение.
Экземпляр роутера обладает методом `.route`, который позволяет добавить путь который необходимо отслеживать. Путь может быть строкой или регулярным выражением. В случае если задана строка, то она трансформируется в регулярное выражение по спец. правилам о которых очень рекомендуем прочитать в [документации](https://github.com/basisjs/articles/blob/master/ru-RU/basis.router.md#path)

В общем случае сконфигурировать роут достаточно просто. Например, в нашем случае достаточно кода приведенного ниже:

```js
var page = router
    .route(':page')
    .param('page')
    .as(function(page) {
        return pages[page] || pages[''];
    });
```

Т.е. в роуте со схемой `:page` мы ищем параметр `page` и далее возвращаем его через метод `.as` роутера. Значение переменной `page` является реактивным и будет изменяться при изменении роута, потому просто передадим эту переменную в качестве значения нашему сателлиту.

__Замечание:__

> Значение сателлита будет изменяться динамически через роутер только в том случае, если сателлит указан явным образом, т.е. через свойство `satellite`. Если указывать сателлит неявно, то изменение `value` роутера обработано не будет, поэтому убедитесь, что сателлит указан явно.

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

Не забудьте в конце вызвать `router.start()`, чтобы роутер начал отслеживать изменения.

Перед тем как создавать второй компонент давайте вынесем данные с героями в отдельный файл, чтобы использовать их в компонентах и не дублировать код:

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

Теперь необходимо изменить `hero-list` чтобы он получал `dataset` из файла с данными, а не создавал их внутри себя. Заодно и выглядеть это будет намного лучше, чем было.

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
        template: resource('./templates/dashboard-item.tmpl'),
        binding: {
            id: 'data:',
            title: 'data:',
        },
    },
    dataSource: dataset
});
```

`app/pages/dashboard/templates/dashboard.tmpl`
```html
<b:style src="./dashboard.css"/>

<div>
  <div class="grid grid-pad">
    <!--{childNodesHere}-->
  </div>
</div>
```

`app/pages/dashboard/templates/dashboard-item.tmpl`:

```html
<a class="col">
  <div class="module hero">
      <h4>{title}</h4>
  </div>
</a>
```

`app/pages/dashboard/templates/dashboard.css`
```css
.col {
  box-sizing: border-box;
  margin-top: 20px;
}

.col:nth-child(odd) {
  padding-right: 10px;
}

.col:nth-child(even) {
  padding-left: 10px;
}

a {
  text-decoration: none;
}

h3 {
  text-align: center;
  margin-bottom: 0;
}

h4 {
  position: relative;
}
.grid {
  margin: 0;
}
.col {
  width: 50%;
  display: inline-block;
}
.module {
  padding: 20px;
  text-align: center;
  color: #eee;
  background-color: #da9b85;
  font-weight: bold;
  border-radius: 2px;
}
.module:hover {
  background-color: #c37c5e;
  cursor: pointer;
  color: white;
}
```

И добавим Dashboard в список страниц:

`app/pages/index.js`
```js
var Dashboard = require('./dashboard/index');
var Heroes = require('./heroes/index');

module.exports = {
    '': Heroes,
    'heroes': Heroes,
    'dashboard': Dashboard
}
```

Если вы сейчас будете менять роуты в строке браузера, то все будет работать без перезагрузки страницы. Но в настоящий приложениях существует навигация, чтобы удобно переходить между разделами, поэтому давайте добавим компонент навигации в наше приложение.

Значение `selected` мы будем вычислять также из роутера, как и во время подстановки компонентов и тем самым обеспечим выделение активного пункта меню.

`app/components/navigation/index.js`
```js
var Node = require('basis.ui').Node;
var Value = require('basis.data').Value;
var router = require('basis.router');
var currentPage = Value.from(router.route(':page').param('page'));

module.exports = new Node({
    template: resource('./templates/navigation.tmpl'),
    childClass: {
        template: '<a href="{link}" class="{selected}" event-click="navigate">{title}</a>',
        selected: currentPage.compute((node, page) => {
            return node.link == page
        }),
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
        { title: 'Dashboard', link: 'dashboard' },
        { title: 'Heroes', link: 'heroes' }
    ]
});
```

`app/components/navigation/templates/navigation.tmpl`
```html
<b:style src="./navigation.css"/>

<nav></nav>
```

`app/components/navigation/templates/navigation.css`
```css
nav {
  text-align: center;
}

nav a {
  padding: 5px 10px;
  text-decoration: none;
  margin-top: 10px;
  display: inline-block;
  margin: 0 10px;
  background-color: #da9b85;
  color: white;
  border-radius: 4px;
}
nav a:visited {
  color: #c37c5e;
  box-shadow: 1px 1px 4px 0px #000;
}
nav a:hover {
  color: wthie;
  background-color: #da9b85;
}
a.selected {
  color: white;
  background: #c37c5e;
}
```

Теперь сателлитом подключим компонент навигации в наше приложение:

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

<div class="wrapper">
    <div>
        <h1>Tour of heroes</h1>
        <!--{navigation}-->
        <!--{content}-->
    </div>
</div>
```

Теперь у нас есть два полноценных роута с нашими компонентами. Можете считать, что вы написали первое SPA на `basis.js`!

В следующей главе мы поговорим о том, как работать с HTTP и синхронизировать наши данные с сервером.
