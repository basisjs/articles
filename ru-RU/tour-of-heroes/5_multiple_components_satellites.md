# Сателлиты: вложенные компоненты и их взаимодействие

В этой главе мы добавим возможность редактировать героев в списке, а также разберем важное понятие сателлитов в `basis.js`.

До текущего момента мы располагали все другие компоненты через `childNodes`, но такой способ годится в основном только для всяческих списков. В реальном проекте нам необходимо вкладывать одни компоненты в другие в самые разные места в шаблонах и часто в единственном экземпляре. Для подобных задач `childNodes` малопригоден и поэтому тут на помощь приходят `satellite`'ы.

До этого мы переносили компонент для редактирования героев в отдельный модуль именно для того чтобы позже использовать его в сателлитах. Так давайте сделаем это!

Для того чтобы использовать компонент в качестве сателлита необходимо в ноде указать свойство `satellite` и в качестве ключа указать имя сателлита по-вашему усмотрению, а в качестве значения свойства должен быть ваш компонент.

Давайте немного отрефакторим наше приложение и вынесем уже существующий код из `app.js` в отдельные компоненты.

Список героев:

`/app/components/hero-list/index.js`:
```js
var Node = require('basis.ui').Node;
var hero = require('../hero/index');
var DataObject = require('basis.data').Object;
var Dataset = require('basis.data').Dataset;

var dataset = new Dataset({
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

module.exports = new Node({
    template: resource('./templates/hero-list.tmpl'),
    childClass: hero,
    dataSource: dataset
});
```

`/app/components/hero-list/templates/hero-list.tmpl`
```html
<b:style src="./hero-list.css"/>

<ul class="heroes"></ul>
```

`/app/components/hero-list/templates/hero-list.css`
```css
.heroes {
  margin: 0 0 2em 0;
  list-style-type: none;
  padding: 0;
}
```

И подправим немного `heroes-details`. Во второй главе данные об `id` и `title` хранились в объекте `Hero`. Сейчас же у нас все данные лежат плоско, поэтому изменим код обновления биндингов и удалим жестко заданные данные в `data`:

`app/components/hero-details/index.js`
```js
var Node = require('basis.ui').Node;

var heroDetailsNode = new Node({
    template: resource('./templates/hero-details.tmpl'),
    binding: {
        id: 'data:',
        title: 'data:',
    },
    action: {
        setHeroName: function(e) {
            this.update({
                id: this.data.id,
                title: e.sender.value
            });
        }
    }
});

module.exports = heroDetailsNode;
```

Теперь, когда список лежит отдельным компонентом и компонент редактирования имеет сходную с остальным проектом структуру самое время изменить наш `app.js` и использовать сателлиты.

Сателлиты хранятся в свойстве `satellite`, которое представляет собой объект. Ключи – это имена сателлитов, а значения – ссылки на объекты.

Т.е. нам нужно передать в это свойство два наших компонента следующим образом:

`app.js`:
```js
var list = require('./app/components/hero-list/index');
var details = require('./app/components/hero-details/index');

// ...
module.exports = require('basis.app').create({
    title: 'Basis tour of heroes',
    init: function () {
        return new Node({
            // ...
            satellite: {
                list: list,
                details: details
            },
            // ...
        });
    }
});
```

Но, как мы уже знаем, связь DOM с шаблоном обеспечивается при помощи `binding` свойства, поэтому мы также должны передать туда наши сателлиты:

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
                list: list,
                details: details
            },
            // ...
        });
    }
});
```

Если имена биндинга и сателлита совпадают, то можно использовать сокращённую запись:

```js
// ...
binding: {
    list: 'satellite:',
    details: 'satellite:',
},
// ...
```


Теперь связь сателлитов с шаблоном налажена, и мы можем написать в нашем шаблоне:
`app/template/layout.tmpl`:
```html
<b:style src="./layout.css"/>

<div class="wrapper">
  <div>
    <h1>Tour of heroes</h1>
      <!--{list}-->
      <!--{details}-->
  </div>
</div>
```

Еще немного наши стили:

`layout.css`
```css
HTML,
BODY
{
  height: 100%;
  padding: 0;
  margin: 0;

  padding: 0;
  margin: 0;
  background: #d7dcc6;
  font-family: cursive;
  color: #333;
}

.wrapper {
  width: 400px;
  box-sizing: border-box;
  margin: 50px auto 10px auto;
  padding: 20px;
  box-shadow: 0px 1px 8px 0px #000;
  background-color: white;
}

h1 {
  text-align: center;
}
```

Отлично!
Такая запись хоть и выглядит несколько многословно, но позволяет более тонко настраивать сателлиты изменяя ряд их свойств. Подробнее о них можете почитать в [документации](https://github.com/basisjs/articles/blob/master/ru-RU/basis.dom.wrapper_satellite.md#Автоматические-сателлиты)

Если никакой настройки сателлитов не требуется, то можно использовать более короткую запись - неявное задания сателлитов:

`app.js`
```js
var Node = require('basis.ui').Node;
var list = require('./app/components/hero-list/index');
var details = require('./app/components/hero-details/index');

module.exports = require('basis.app').create({
    title: 'Basis tour of heroes',
    init: function () {
        return new Node({
            template: resource('./app/template/layout.tmpl'),
            binding: {
                list: list,
                details: details
            }
        });
    }
});
```

В таком случае сателлиты будут созданы неявно и всё продолжит работать также, как и раньше.

Подробнее о сателлитах и их дополнительных свойствах можете почитать в [документации](https://github.com/basisjs/articles/blob/master/ru-RU/basis.dom.wrapper_satellite.md).

# Делегирование

Теперь нам нужно добавить возможность редактирования нашего списка. Компонент редактирования у нас уже есть, осталось только каким-то образом связать данные наших компонентов. В этом нам поможет механизм делегирования.

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

Любой `basis.ui.Node` может выбран (selected), если это не переопределено. По умолчанию это состояние не синхронизируется с другими. Для того чтобы состояние синхронизировать с другими узлами используется экземпляр класса `basis.dom.wrapper.Selection`, который является наследником `basis.data.Dataset`. Selection задаётся узлу свойством `selection`, и оно создает контекст выделения (contextSelection) для дочерних узлов. Этот же контекст задают дочерние узлы для своих дочерних узлов, если у них не указан свой `Selection`.

То, что `Selection` является наследником `Dataset` позволяет нам использовать его как источник данных (`dataSource`).

`Selection` - это должен быть либо `Dataset` или `null` если ничего не выбрано.

Как это использовать? Очень просто! Зададим для `hero-list` свойство `selection: true`, что создаст контекст выделения в `hero-list`, который унаследуют `childNodes` этого компонента.

`/app/components/hero-list/index.js`:
```js
module.exports = new Node({
    template: resource('./templates/hero-list.tmpl'),
    childClass: hero,
    selection: true,
    dataSource: dataset
});
```

Все `basis.ui.node` обладают свойством `selected`, которое по умолчанию равно `false`.

Так же для всех компонентов по умолчанию реализовано событие `select`, которое можно использовать в `action`.

Если происходит событие `select` на компоненте, то его свойство `selected` становится равно `true`.

ChildClass `Hero-list` является `Hero`. Т.к. они имеют общий контекст выделения и имеют уже реализацию события `select` и свойства `selected`, то все что нужно сделать чтобы выделение работало это прописать нашему `hero.tmpl` событие `event-click="select"`:

`app/components/hero/templates/hero.tmpl`
```html
<b:style src="./hero.css"/>
<b:isolate/>

<li class="{selected}" event-click="select">
  <span class="badge">{id}</span> {title}
</li>

```

Добавим немного стилей для selected:

`app/components/hero/templates/hero.css`
```css
.selected {
  background-color: #c37c5e;
  color: white;
}
```

Т.к. мы уже знаем, что осуществить передачу данных между компонентами можно при помощи делегатов, то нам осталось только передать выбранный элемент в качестве делегата нашему компоненту `hero-details`.

В `app.js` повесим обработчик на событие выбора нашего списка.
Для этого воспользуемся методом `addHandler` объекта `selection`, и на событие `itemsChanged` добавим обработчик, который будет выставлять в качестве делегата выбранный нами элемент.

Итоговый `app.js`:

`app.js`:
```js
var Node = require('basis.ui').Node;
var list = require('./app/components/hero-list/index');
var details = require('./app/components/hero-details/index');

list.selection.addHandler({
    itemsChanged: function(sender) {
        details.setDelegate(sender.pick());
    }
});

module.exports = require('basis.app').create({
    title: 'Basis tour of heroes',
    init: function () {
        return new Node({
            template: resource('./app/template/layout.tmpl'),
            binding: {
                list: list,
                details: details
            }
        });
    }
});
```

Вот и всё! Теперь мы можем редактировать наших героев просто выбирая их из списка.

- [Исходный код урока](https://github.com/prostoandrei/basis-tour-of-heroes/tree/part5)
- Следующий урок: [Роутинг](6_routing.md)
