# DataObject, DataSets, DataSource

В этой главе мы немного разберем то что уже написали, а также введем несколько новых понятий чтобы мы могли двигаться дальше.

## DataObjects

Во второй главе при реализации live редактирования мы использовали метод `this.update` в action `setHeroName`. Пришло время понять откуда метод взялся и с чем связан.

```js
action: {
    setHeroName: function(e) {
      this.update({
        hero: {
          id: this.data.hero.id,
          name: e.sender.value
        }
      });
  }
}
```

Метод `update` унаследован от из базового класса `basis.data.Object`.

Т.к. многое из того что мы будем делать дальше связано с `DataObject` необходимо разобраться с ними подробнее.

`DataObject` является предком для многих других классов, в том числе для узлов интерфейса `basis.ui.Node` при помощи которых мы все это время реализовывали наши компоненты.

Данные экземпляра `DataObject` хранятся в свойстве `data`. Методу `update` передается объект - набор новых значений. Метод `update` сравнивает значения ключей в переданном объекте с имеющимися, и, если все значения совпадают – возвращает `false`. Если есть различия, то возвращает дельту, объект, который содержит измененные ключи и их значения до изменения.

Когда меняются значения в `data` – выбрасывается событие `update`. Обработчики события получают параметр `delta` - дельта изменений. С помощью дельты можно определить, что поменялось и если необходимо предпринять какие-либо действия.

Подписаться на `update` можно двумя способами.

Непосредственно в объекте:
```js
module.exports = new Node({
    // ...
    handler: {
        update: function(sender, delta) {
            console.log(sender, delta);
        }
    },
    action: {
        update: function (e) {
            this.update({
                title: e.sender.value
            });
        }
    }
});
```

Или использовав метод объектов:

```js
SomeNodeOrDataObject.addHandler({
    update: function(sender, delta) {
        console.log(sender, delta);
    }
});
```

Подробнее о DataObject можете почитать в [документации](https://github.com/basisjs/articles/blob/master/ru-RU/basis.data.Object.md), но сейчас давайте сконцентрируемся на нашем небольшом приложении и еще одном базовом элементе `basis.js`.

## Datasets

`Dataset` – неупорядоченное множество объектов данных (экземпляров `basis.data.Object` и его потомков). Т.е. по сути это набор `DataObject`'ов.

`Dataset`'ы можно передавать как источник данных компонентов, тогда данные будут браться из `data` как это было во второй главе.

Для связи компонента с набором используется свойство `dataSource` при создании экземпляра и метод `setDataSource` после. Всю работу по добавлению и удалению узлов берет на себя набор. Технически экземпляр `basis.ui.Node` для которого задано свойство `dataSource`, слушает изменения в привязанном наборе и синхронизирует состав своих дочерних узлов с ним.

При синхронизации с набором используются свойства `childClass` и `childFactory` для создания дочерних узлов.

Давайте немного изменим наш `app.js` чтобы в качестве источника данных использовался `dataset`.

Прошу не пугаться - запись действительно выглядит громоздкой, но приведена она сейчас для учебных целей. В последующих главах мы заменим данное объявление на более лаконичное и оправданное.

`app.js`:
```js
var Node = require('basis.ui').Node;
var Hero = require('./app/components/hero/index');
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

module.exports = require('basis.app').create({
    title: 'Basis tour of heroes',
    init: function () {
        return new Node({
            template: resource('./app/template/layout.tmpl'),
            childClass: Hero,
            dataSource: dataset
        });
    }
});
```

И изменим немного компонент героя добавив `data:`:

`app/components/hero/index.js`
```js
var Node = require('basis.ui').Node;

module.exports = Node.subclass({
    template: resource('./templates/hero.tmpl'),
    binding: {
        id: 'data:',
        title: 'data:',
    }
});
```

Отлично! Теперь наш список синхронизирован с `dataset`. Можете убедиться в этом изменив `dataset`. Например так:

```js
setTimeout(function() {
    dataset.remove(dataset.pick());
}, 3000)
```

Еще раз рекомендуем почитать о `DataObject` и `DataSet` в документации, чтобы знать какими методами они обладают и как устроены:

* [DataObject](https://github.com/basisjs/articles/blob/master/ru-RU/basis.data.Object.md)
* [DataSet](https://github.com/basisjs/articles/blob/master/ru-RU/basis.data.datasets.md)

Полный пример урока можете скачать по [ссылке](https://github.com/prostoandrei/basis-tour-of-heroes/tree/part4)
