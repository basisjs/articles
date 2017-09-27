# Ноды. Редактор героев

Для того чтобы запустить наше приложение необходимо ввести `basis server` в командной строке.
После этого запустится сервер в `watch mode` и будет реагировать на сохранение файлов.

Для файлов форматов `*.css, *.l10n, *.tmpl` работает `HMR` (Hot module replacement)  и нет необходимости перезагружать браузер в случае изменения файлов этих форматов.

В случае изменения JS файлов необходимо перезагрузить браузер вручную. О необходимости перезагрузить страницу вам также напомнит `basisjs-tools` небольшой рыжей панелькой под собой.

Прежде всего нам необходимо научиться создавать компоненты и переносить наши данные из них в DOM браузера. Давайте сделаем это на примере нашего первого супер-героя.

Для начала опишем шаблон куда будем выводить наши данные в файле `layout.tmpl`:
```html
<div>
  <h1>{title}</h1>
  <h2>{name} is a hero!</h2>
  <div><label>Id: </label>{id}</div>
  <div>
    <label>Name: </label>
    <input value="{name}" placeholder="Enter name">
  </div>
</div>
```

`{name}` - это области куда буду рендериться наши данные.
Сама связь между шаблоном и компонентом задается через свойство `binding` унаследованного от `basis.ui.node`.

Теперь добавим кода данных в наш `app.js`

```js
var Node = require('basis.ui').Node;

module.exports = require('basis.app').create({
    title: 'Basisjs tour of heroes',

    init: function() {
        return new Node({
            template: resource('./app/template/layout.tmpl'),
            data: {
                title: 'Basis tour of heroes',
                hero: {
                    id: 1,
                    name: 'Superhero'
                }
            },
            binding: {
                id: 'data:hero.id',
                name: 'data:hero.name',
                title: 'data:'
            }
        });
    }
});
```

Заранее отметим, что это не самый эффективный способ работать с данными в `basis.js`, но это именно то, что сейчас нам нужно для понимания работы и обучения.

Итак, тут нас интересуют два поля - `data` и `binding`.

В `binding` мы указываем в ключах объекта то, что будем использовать в шаблонах в фигурных скобках `{}`, а в качестве значений указываем то как эти данные непосредственно получить.

Например:

```js
binding: {
    name: 'data:hero.name'
}
```

Биндинг `name` берётся из поля `data` и далее обращается к полю `name` объекта `hero`. Так происходит привязка данных из `data` в DOM. Тоже самое и с `id`.

Поле `title` это отдельный случай. Если название биндинга совпадает с полем в `data`, то можно использовать короткую запись.

```js
binding: {
    title: 'data:'
}
```

Тогда значение `title` также возьмётся из `data`, как если бы мы написали полный путь `data:title`

Теперь добавим возможность редактирования.

В первую очередь, нам необходимо отлавливать событие ввода данных в нашем `input`. Для того чтобы отлавливать браузерные события в шаблонах используется следующий синтаксис:

```
event-typeEvent="eventHandlerName"
```

Т.e. в нашем шаблоне это будет выглядеть примерно так:

`app/template/layout.tmpl`
```html
<div>
  <h1>{title}</h1>
  <h2>{name} is a hero!</h2>
  <div><label>Id: </label>{id}</div>
  <div>
    <label>Name: </label>
    <input value="{name}" event-input="setHeroName" placeholder="Enter name">
  </div>
</div>
```

В самом компоненте есть свойство `action`, которое также унаследовано от `basis.ui.node` в котором нам необходимо указать обработчик `setHeroName`.

Для обновления `data` используется метод `update` от `basis.data.object`, который обновляет данные в `data` и неявно вызывает обновление в `DOM` биндинга. О самих `DataObjects`мы поговорим позже (в 4й главе), пока просто можете использовать этот унаследованный метод в нашем коде.

```js
var Node = require('basis.ui').Node;

module.exports = require('basis.app').create({
    title: 'Basisjs tour of heroes',

    init: function () {
        return new Node({
            template: resource('./app/template/layout.tmpl'),
            data: {
                title: 'Basis tour of heroes',
                hero: {
                    id: 1,
                    name: 'Superhero'
                }
            },
            binding: {
                id: 'data:hero.id',
                name: 'data:hero.name',
                title: 'data:'
            },
            action: {
                setHeroName: function (e) {
                    this.update({
                        hero: {
                            id: this.data.hero.id,
                            name: e.sender.value
                        }
                    });
                }
            }
        });
    }
});

```

На самом деле, при таком способе обновления многое из того что происходит скрыто под капотом. Более подробно о том как это все происходит изнутри вы можете почитать в [документации](https://github.com/basisjs/articles/blob/master/ru-RU/tutorial/part1/index.md#Биндинги-и-действия).

В итоге получаем живое редактирование героя прямо на странице!

Полный пример урока можете скачать по [ссылке](https://github.com/prostoandrei/basis-tour-of-heroes/tree/part2)
