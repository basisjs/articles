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

Отлично! Теперь нам необходимо научиться пользоваться роутером чтобы динамичкески переключать `Pages` из `app/pages/index`. Вся суть роутига как раз и будет заключаться в изменении значения сателлита `content`.

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

Т.е. в роуте со схемой `:page` мы ищем параметр `page` и далее возвращаем его через метод `.as` роутера. Значение переменной `page` является реактивным и будет изменяться при изменении роута


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
                content: page.value
            },
        });
    }
});

router.start();
```

Не забудьте в конце вызвать `router.start()` чтобы роутер начал отслеживать изменения.

Теперь давайте добавим наш Dashboard.

```js
```
