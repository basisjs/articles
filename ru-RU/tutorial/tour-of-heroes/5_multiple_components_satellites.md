# Сателлиты

В этой главе мы добавим возможносте редактировать героев в списке, а так же разберем важное понятие сателлитов в Basis.

До текущего момента мы просто располагали все другие компоненты просто через `childNodes`, но такой способ годится в основном только для всяческих списков. В реальном проекте нам необходимо вкладывать одни компоненты в другие в самые разные места в шаблонах и часто в единственном экземпляре. Для подобных задач `childNodes` малопригоден и поэтому тут на помощь приходят `satellite`'ы

До этого мы переносили компонент для редактирования героев в отдельный модуль именно для того чтобы позже использовать его в сателлитах. Так давайте сделаем это!

Для того чтобы использовать компонент в качестве сателлита необходимо в ноде указать свойство `satellite` и в качестве ключа указать имя сателлита по-вашему усмотрения, а в качесте значения свойста должен быть ваш компонент.

Давайте немного отрефакторим наше приложение и вынесем уже существующий код в отдельные компоненты.

`/app/components/hero-list/index.js`:
```js
var Node = require('basis.ui').Node;
var Hero = require('../hero/hero');

module.exports = new Node({
    template: resource('./templates/hero-list.tmpl'),
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

```

`/app/components/hero-list/templates/hero-list.tmpl`
```html
<b:style src="./hero-list.css"/>

<ul class="heroes"></ul>
```

Теперь когда список и компонент редактирования лежат отдельными компонентами сапмое время изменить наш `app.js` и использовать сателлиты.

Сателлиты хранятся в свойстве satellite объекта `basis.node.ui`, которое представляет собой объект. Ключи – это имена сателлитов, а значения – ссылки на объекты.

Так им образом нам нужно передать в это свойство два наших компонента следующим образом:

`app.js`:
```js
// ...
module.exports = require('basis.app').create({
    title: 'Basis tour of heroes',
    init: function () {
        return new Node({
            // ...
            satellite: {
                list: List,
                details: Details
            },
            // ...
        });
    }
});
```

Но как мы уже знаем с DOM с шаблоном обеспечивается при помощи `binding` свойства, поэтому мы также должны передать туда наши сателлиты:

`app.js`
```js
// ...
module.exports = require('basis.app').create({
    title: 'Basis tour of heroes',
    init: function () {
        return new Node({
            // ...
            binding: {
                list: 'satellite:list',
                details: 'satellite:details',
            },
            satellite: {
                list: List,
                details: Details
            },
            // ...
        });
    }
});
```


После этого связь сателлитов с шаблоном налажена и мы можем написать в нашем шаблоне как и с обычными биндингами:

`app/template/layout.tmpl`:
```html
<div>
    <h1>Tour of heroes</h1>
    <!--{list}-->
    <!--{details}-->
</div>
```

Отлично! Т.к. запись в JS выглядит слегка многословно, существует еще способ неявного задания сателлитов:

```js
// ...
module.exports = require('basis.app').create({
    title: 'Basis tour of heroes',
    init: function () {
        return new Node({
            template: resource('./app/template/layout.tmpl'),
            binding: {
                list: List,
                details: Details
            },
        });
    }
});
```

В таком случае сателлиты будут созданы неявно и всё продолжит работать также как и раньше

# Делегирование

Одним из важных понятий при работе с Basis является понитие делегирования. При помощи него мы можем шарить данные между компонентами и объектами.

`Пример на DataObject`:
```js
var DataObject = basis.require('basis.data').Object;

var foo = new DataObject();
var bar = new DataObject();

foo.setDelegate(bar);
foo.update({ prop: 123 });

console.log(foo.data.prop); // > 123
console.log(bar.data.prop); // > 123
```



TODO: Переписать сюда все на data: и объясниь почему
