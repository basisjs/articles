Быстрый старт

Разрабатывая приложения, чаще

# Работа с данными

Сначала создаются классы моделей и описываются их поведение и взаимосвязи (дата-логическая схема данных). В описание поведения входит:

  - определение полей
  -
  -

Общая схема такая:

  - описываем тип модели
  - создаем различные наборы
  - создаем модели
  - связываем наборы и модели с представлениями

Описывать типы не является обязательным, поэтому мы пока пропустим этот шаг и попробуем создать несколько моделей, добавить их набор и привязать к представлению.

## Создание моделей

В `basis.js` есть несколько классов описывающие модели. Самым простым является `basis.data.Object`, от него наследуются другие классы. Чтобы начать работать с данным достаточно создать экземпляр и передать ему объект в качестве значения свойства `data`.

```js
basis.require('basis.data');

var model = new basis.data.Object({
  data: {
    hello: 'world'
  }
});
```

## Создание наборов

Для хранения множества моделей используются наборы. Для них тоже есть множество классов с разным назначением, но для ручного управления составом множества используется  `basis.data.Dataset`. При создании такого набора можно указать начальный список моделей, это должен быть массив экземпляров `basis.data.Object`. Либо менять состав позже используя методы `add`, `remove`, `clear` и др.

```js
basis.require('basis.data');

var dataset = new basis.data.Dataset({
  items: [model1, model2, model3]
});

dataset.add(model4);
dataset.remove(model2);
dataset.getItems();  // вернет [model1, model3, model4]
```

Если нужно создать модели из некоторого масива, то можно воспользоваться функцией-хелпером `basis.data.wrap`. Первым параметром функция принимает массив с данными, а вторым – флаг, что нужно получить: экземпляры `basis.data.Object` или конфиги.

```js
basis.require('basis.data');

var employers = new basis.data.Dataset({
  items: basis.data.wrap([
    { name: 'Willi', salary: 30 },
    { name: 'Billi', salary: 50 },
    { name: 'Dilli', salary: 70 },
    { name: 'Jhon', salary: 110 }
  ], true)
});
```

Стоит помнить, что наборы являются неупорядоченным множеством. Из этого вытекает, что любая модель имеет максимум одно вхождение в набор и их порядок не определен.

Помимо наборов с ручным управление составом, есть так же автоматические наборы. Их состав задается путем указания других наборов в качестве источника и некоторого правила. Это своего рода операции над множествами, в результате которых получается новый набор, с другим составом.

Следующий пример показывает как создать набор, который содержит сотрудников с зарплатой больше 100. Для этого используется спецаильный класс набора `basis.data.dataset.Subset` (подмножество).

```js
basis.require('basis.data');
basis.require('basis.data.dataset');

var employers = new basis.data.Dataset({
  items: basis.data.wrap([
    { name: 'Willi', salary: 30 },
    { name: 'Billi', salary: 50 },
    { name: 'Dilli', salary: 170 },
    { name: 'Jhon', salary: 110 }
  ], true)
});

var greaterThan100Salary = new basis.data.dataset.Subset({
  source: employers,
  rule: function(employer){
    return employer.data.salary > 100;
  }
});

greaterThan100Salary.forEach(function(employer){
  console.log(employer.data.name, employer.data.salary);
});
// 'Dilli' 170
// 'Jhon' 110
```

Основным плюсом является то, что такие наборы (как `greaterThan100Salary`) являются динамическими, то есть содержат всегда актуальную информацию. Если изменится состав источника (набор `employers`) или изменятся данные модели, такой набор обновит свой состав, чтобы он отвечал заданному правилу. Источник и правило можно изменить в любой момент (используя методы `setSource` и `setRule` соотвественно), и из таких наборов можно составлять длинные цепочки преобразований.

## Привязка данных к представлению

Для того чтобы привязать модель к представлению используется механизм [делегирования](). Ссылка на модель хранится в свойстве `delegate`, и может быть задано и во время создания представления и изменено после используя метод `setDelegate`. При делегировании, свойство `data` представления указывает на тот же объект, что и свойство `data` модели – у них один общий объект для хранения данных. Поэтому не важно чей метод `update` вызывать, у модели или у представления, результат будет один: если данные изменятся, то для всех будет вызвано событие `update` и так все узнают об изменениях.

```js
basis.require('basis.data');
basis.require('basis.ui');

var model = new basis.data.Object({
  data: {
    hello: 'world'
  }
});
var view = basis.ui.Node({
  delegate: model
});

console.log(view.data === model.data);
// true
```

Если у представления нет делегата, то оно имеет соственный объект для хранения данных. Класс `basis.ui.Node` является наследником `basis.data.Object`, а потому поддерживает все функции модели. Представления могут делегировать другие представления, и цепочка делегирования может быть довольно длинной.

Так же к представлению можно привязать набор, для этого используется свойство `dataSource` и метод `setDataSource` соотвественно. Когда к представлению привязывается набор, то представление синхронизирует состав дочерних представлений (`childNodes`) с составом набором, автоматически создавай и разрушая дочерние представления. А каждому дочернему представлению ставится одна из моделей набора в качестве делегата.

```js
basis.require('basis.data');
basis.require('basis.ui');

var employers = new basis.data.Dataset({
  items: basis.data.wrap([
    { name: 'Willi', salary: 30 },
    { name: 'Billi', salary: 50 },
    { name: 'Dilli', salary: 170 },
    { name: 'Jhon', salary: 110 }
  ], true)
});

var employersList = new basis.ui.Node({
  dataSource: employers
});
```

## Описание типов

Часто удобно описывать.

```js
basis.require('basis.entity');

var Employer = basis.entity.createType('Employer', {
  name: String,
  salary: Number
});

var employer = Employer({
  name: 'Jhon',
  salary: 110
});

var someEmployers = [
  { name: 'Willi', salary: 30 },
  { name: 'Billi', salary: 50 },
  { name: 'Dilli', salary: 170 },
  { name: 'Jhon', salary: 110 }
].map(Employer);
```

Индекс

```js
basis.require('basis.entity');

var Employer = basis.entity.createType('Employer', {
  id: basis.entity.IntId,
  name: String,
  salary: Number
});

var employer = Employer({
  id: 123,
  name: 'Jhon',
  salary: 110
});

console.log(employer === Employer(123));
// > true

Employer({ id: 123, salary: 150 });
console.log(employer.data.salary);
// > 150
```

## Работа с серверным API

syncAction

```js
basis.require('basis.data');
basis.require('basis.net.action');

var model = new basis.data.Object({
  data: {
    id: 1
  },
  syncAction: basis.net.action.create({
    url: '/employer/:id',
    request: function(){
      return {
        routerParams: {
          id: this.data.id
        }
      };
    },
    success: function(data){
      this.update(data);
    }
  })
});
```

```js
basis.require('basis.ui');

var view = new basis.ui.Node({
  delegate: model,
  active: true   // это вынудит model выполнить свой syncAction метод,
                 // если он определен
});
```

Метод `syncAction` можно определить для любого класса унаследованого от `basis.data.AbstractData`, от которого наследуются все классы моделей и наборов, в том числе и сами представления. Чаще такие методы описываются на уровне класса. Можно добавить `syncAction` уже после создания экземпляра (используя метод `setSyncAction`), а так же изменить логику когда он должен выполняться.

Используя типизированные модели, методы определяются на уровне типа и общая схема работы выглядит так:

```js
basis.require('basis.entity');
basis.require('basis.net.action');
basis.require('basis.ui');

var Employer = basis.entity.createType('Employer', {
  id: basis.entity.IntId,
  name: String,
  salary: Number
});

Employer.extendClass({
  syncAction: basis.net.action.create({
    url: '/employer/:id',
    request: function(){
      return {
        routerParams: {
          id: this.getId()
        }
      };
    },
    success: function(data){
      this.update(Employer.reader(data));
    }
  })
});

var view = new basis.ui.Node({
  delegate: Employer(123),
  active: true
});
```

То же можно сделать и для набора, чтобы, например, получать список записей определенного типа.

```js
basis.require('basis.entity');
basis.require('basis.net.action');
basis.require('basis.ui');

var Employer = basis.entity.createType('Employer', {
  id: basis.entity.IntId,
  name: String,
  salary: Number
});

Employer.all.setSyncAction(basis.net.action.create({
  url: '/employer/',
  success: function(data){
    this.sync(data.map(Employer.reader));
  }
});

var view = new basis.ui.Node({
  dataSource: Employer.all,
  active: true
});
```

При такой организации представление ничего не знает об устройстве синхронизации моделей и наборов. Представление лишь указывает какие данные ему нужны, и является ли оно активным потребителем. Это позволяет проще разбивать код на модули, данные описывать отдельно от представлений, и для разных представлений использовать одни и те же модели и наборы.

## Состояние

Созданные с помощью `basis.net.action.create` методы отличаются от обычных функций. Так как не только выполняют запрос к серверу, но и меняют состояние экземпляра, отражая тем самым стадию процесса.

При делегировании, состояние разделяется между всеми связанными объектами, наряду с данными. То есть у всех объектов одно и то же состояние. Нет разницы у какого объекта вызывается метод `setState`, если оно меняется, то оно меняется у всех и у всех срабатывает событие `stateChanged`.

```js
var employer = Employer(123);
var view = new basis.ui.Node({
  delegate: employer,
  active: true,
  handler: {
    stateChanged: function(view, oldState){
      console.log(oldState + ' -> ' + view.state + ' (' + view.state.data + ')');
    }
  }
});

console.log(view.state === employer.state);
// > true

employer.setState(basis.data.STATE.ERROR, 'Error details');
// > 'undefined -> error (Error details)'
```

Представления так же синхронизируют состояние набора, привязанного через `dataSource`, со своим свойством `childNodesState`, если используется. Но эта связь одностороняя, то есть при изменении состояния набора меняется значение `childNodesState`, но не наоборот.

## Описание представления

```js
basis.require('basis.ui');

var view = new basis.ui.Node({
  template: resource('./foo.tmpl'),
  binding: {
    name: {
      events: 'update',
      getter: function(view){
        return view.data.name;
      }
    }
  },
  action: {
    sayHello: function(){
      alert('Hello world!');
    }
  }
});
```

```js
basis.require('basis.ui');

var view = new basis.ui.Node({
  header: 'My list',

  template: resource('./list.tmpl'),
  binding: {
    header: 'header'
  },

  childClass: {
    template: resource('./item.tmpl'),
    binding: {
      name: 'data:',
      salary: 'data:'
    }
  }
});
```

## Шаблоны

```html
<b:style src="./list.css"/>
<div class="my-list">
  <h1>{header}</h1>
  <ul{childNodesElement}/>
</div>
```

```html
<b:style src="./item.css"/>
<li class="my-list-item my-list-item_{selected}">
  {name}: {salary}
</li>
```
