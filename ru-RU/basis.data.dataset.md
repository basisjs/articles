# basis.data.dataset

Данное пространство имен описывает различные автоматические наборы. Данный вид наборов не управляет своим составом напрямую, а зависит от состава другого набора (или наборов) и некоторых заданных правил.

![Структура классов basis.data.dataset](img/data-datasets.png)

Автоматические наборы можно воспринимать как операции над множествами. Так `basis.data.dataset` экспортирует классы, которые позволяют совершать следующие операции:

  * [Merge](dataset/merge.md) - объединение нескольких множеств в одно, по правилу (объединение, разность, дополнение и др);
  * [Subtract](dataset/subtract.md) - вычитание одного множества из другого;
  * [MapFilter](dataset/mapfilter.md) - конвертация входных элементов в другие и/или их фильтрация;
  * [Filter](dataset/filter.md) - фильтрация (подмножество);
  * [Slice](dataset/slice.md) - срез;
  * [Split](dataset/split.md) - разбиение на подмножества 1:1 (группировка);
  * [Cloud](dataset/cloud.md) - разбиение на подмножества 1:M;
  * [Extract](dataset/extract.md) - разворачивание;

Большинство автоматических наборов наследуются от [`SourceDataset`](#sourcedataset), принимают единственный набор на вход. Некоторые автоматические наборы принимаю 2 и более наборов (такие как [`Subtract`](dataset/substract.md) или [`Merge`](dataset/merge.md)).

## SourceDataset

Инкапсулирует работу с источником данных. Чаще всего не используется напрямую, а является основой (предком) для других автоматических наборов.

Источник данных задается в свойстве `source` при создании набора или методом `setSource` после.
К значению свойства `source` применяется [resolveDataset](basis.data.datasets.md#resolvedataset) для получения ссылок на набор.

При смене источника данных инициируется событие `sourceChanged`, а в качестве аргументов передаются: `sender` (экземпляр `SourceDataset`) и ссылка на старый источник данных.

```javascript
var DataObject = basis.require('basis.data').Object;
var Dataset = basis.require('basis.data').Dataset;
var SourceDataset = basis.require('basis.data.dataset').SourceDataset;
var MyDataset = SourceDataset.subclass();

var foo = new DataObject();
var bar = new DataObject();

var datasource = new Dataset({ items: [foo, bar] });
var datasource2 = new Dataset({ items: [bar] });

var myDataset = new MyDataset({ source: datasource });

myDataset.setSource(datasource2);
```

Экземпляры `SourceDataset` поддерживают [listen](basis.event.md#listen) для `source`.
