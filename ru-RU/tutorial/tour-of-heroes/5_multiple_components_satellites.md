# Сателлиты

В этой главе мы добавим возможносте редактировать героев в списке, а так же разберем важное понятие сателлитов в `basis.js`.

До текущего момента мы просто располагали все другие компоненты просто через `childNodes`, но такой способ годится в основном только для всяческих списков. В реальном проекте нам необходимо вкладывать одни компоненты в другие в самые разные места в шаблонах и часто в единственном экземпляре. Для подобных задач `childNodes` малопригоден и поэтому тут на помощь приходят `satellite`'ы.

До этого мы переносили компонент для редактирования героев в отдельный модуль именно для того чтобы позже использовать его в сателлитах. Так давайте сделаем это!

Для того чтобы использовать компонент в качестве сателлита необходимо в ноде указать свойство `satellite` и в качестве ключа указать имя сателлита по-вашему усмотрения, а в качесте значения свойста должен быть ваш компонент.

Давайте немного отрефакторим наше приложение и вынесем уже существующий код в отдельные компоненты.

Список героев:

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

Теперь когда список и компонент редактирования лежат отдельными компонентами самое время изменить наш `app.js` и использовать сателлиты.

Сателлиты хранятся в свойстве `satellite`, которое представляет собой объект. Ключи – это имена сателлитов, а значения – ссылки на объекты.

Т.е. нам нужно передать в это свойство два наших компонента следующим образом:

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

Но как мы уже знаем связь DOM с шаблоном обеспечивается при помощи `binding` свойства, поэтому мы также должны передать туда наши сателлиты:

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

Отлично! Т.к. запись в эта выглядит несколько многословно, существует еще способ неявного задания сателлитов:

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

В таком случае сателлиты будут созданы неявно и всё продолжит работать также как и раньше.

Подбронее о сателлитах и их дополнительных свойствах можете почитать в [документации](https://github.com/basisjs/articles/blob/master/ru-RU/basis.dom.wrapper_satellite.md).

# Делегирование

Теперь нам нужно добавить возможность редактирования нашего списка. Компонент редактирования у нас уже есть, осталось только каким-то образом связать данные наших компонентов. В этом нам поможет механихм делегирования.

При помощи него мы можем шарить данные между компонентами и объектами.

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

Таким образом данные одного объекта стали источником данных для другого.

Отлично! Теперь осталось передать выбранные элементы в качестве данных. В этом нам поможет `Selection`.

## Selection

Любой `basis.ui.Node` может выбран (selected), если это не переопределено. По умолчанию это состояние не синхронизируется с другими. Для того чтобы состояние синхронизировать с другими узлами используется экземпляр класса `basis.dom.wrapper.Selection` который является наследником ` basis.data.Dataset`. Selection задаётся узлу свойством `selection`, и он создает контекст выделения (contextSelection) для дочерних узлов. Этот же контекст задают дочерние узлы для своих дочерних узлов, если у них не указан свой `Selection`.

То что Selection является наследником Dataset позволяет нам использовать его как источник данных (`dataSource`).

Как это использовать? Очень просто! Зададим для hero-list свойство `selection: true` что создаст контекст выделения в hero-list, который унаследуют `childNodes` этого компонента.

`/app/components/hero-list/index.js`:
```js
module.exports = new Node({
    template: resource('./templates/hero-list.tmpl'),
    childClass: Hero,
    selection: true,
    dataSource: dataset
});
```

Все `basis.ui.node` реализовывают свойство `selected` , которое по-умолчанию равно `false`. Так же по-умолчанию реализовано событие `select`

ChildClass `Hero-list` является `Hero`. Т.к. они имеют общий контекст выделения и имеют уже реализацию собтытия `select` и свойства `selected`, то все что нужно сделать чтобы выделение работало это прописать нашему `hero.tmpl` событие `event-click="select"`:

`app/components/hero/templates/hero.tmpl`
```html
<li class="{selected}" event-click="select">
    <span class="badge">{id}</span> {title}
</li>
```

Добавим немного стилей для selected:

`app/components/hero/templates/hero.css`
```css
.selected {
  background-color: #CFD8DC !important;
  color: white;
}
```

Т.к. мы уже знаем что осуществить передачи данных между компонентами можно при помощи делегатов нам осталось только передать выбраннысми элемент в качестве делегата нашему  компоненту `hero-details`.

Для этого в app.js повесим обработчик на событие выбора нашего списка.
Для этого пвоспользуемся методом `addHandler` объекта `selection` и на событие `itemsChanged` добавим обработчик, который будет выставлять в качестве делегата выбранный нами элемент.

`app.js`:
```js
List.selection.addHandler({
    itemsChanged: function(sender){
        Details.setDelegate(sender.pick());
    }
});
```

Вот и всё! Теперь мы можем редактировать наших героев просто выбирая их из списка.

Полный пример урока можете скачать по [ссылке](https://github.com/prostoandrei/basis-tour-of-heroes/tree/part5)
