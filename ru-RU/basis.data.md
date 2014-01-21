# basis.data

Базовым пространством имен для типов данных является `basis.data`. В нем описываются основные классы данных.

Выделяются три большие группы классов:

  * Значение (value) – значение атомарно (не делимо), даже если имеет сложную структуру (например, объект, изменения структуры которого не отслеживаются). Базовым классом для этой группы является `basis.data.Value`. ([подробнее](basis.data.Value.md))
  
  * Объект (object) – данные хранятся в виде ключ-значение. Наиболее часто используемый тип данных, является предком для многих классов, в том числе для узлов интерфейса (`basis.ui.Node`). ([подронее](basis.data.Object.md))
  
  * Набор (dataset) – неупорядоченное множество объектов данных (на данный момент экземпляров `basis.data.Object` и его потомков). Данными является информация о вхождении объектов в некоторое множество. ([подробнее](basis.data.datasets.md))

## AbstractData

Класс `basis.data.AbstractData` ([docs](http://basisjs.com/docs#basis.data.AbstractData)) является основой для классов данных. От него наследуются `Value`, `Object` и `AbstractDataset`.

Он не реализует механизмы для хранения непосредственно данных (поэтому в его названии есть слово `Abstract`), но вводит несколько механизмов, общих для остальных классов данных:

  * состояние;

  * подписка;
  
  * абстрактная синхронизация.

### Состояние

Все объекты данных имеют состояние. Состояние хранится в свойстве `state`. Значение состояния – это одно из константных значений, определенных в `basis.data.STATE`:

  * UNDEFINED – говорит о том, что невозможно определить степень достоверности данных: данные еще не были инициализированы или синхронизированы. Это состояние по умолчанию.

  * PROCESSING – определяет, что происходит некоторый процесс, связанный с данным объектом, например, сохранение изменений или синхронизация. Пока объект данных находится в таком состоянии, другие процессы не должны инициироваться (пока он не перейдет в другое состояние).

  * ERROR – показывает, что последний процесс, связанный с этим объектом, закончился неудачей. В интерфейсе при этом может быть отображено сообщение об ошибке и предложены варианты ее исправления.

  * READY – нормальное состояние данных, показывает, что данные инициализированы или синхронизированы, в зависимости от логики.

  * DEPRECATED – данные устарели, возможно, нужна синхронизация.

Состояние может хранить произвольные данные в свойстве `data`. Чаще всего это используется для состояния `ERROR`, чтобы сохранить детали об ошибке.

Для изменения состояния используется метод `setState`, который принимает аргументы:

  * state - новое значение состояния;
  * data - данные состояния (опционально).

Если значения является неправильным (такого кода нет в `basis.data.STATE`), то будет выброшено исключение `Wrong state value`.

```js
basis.require('basis.data');

var obj = new basis.data.AbstractData({
  state: basis.data.STATE.READY    // можно задавать состояние при создании
                                   // экземпляра, по умолчанию будет UNDEFINED
});

obj.setState(basis.data.STATE.ERROR, 'Some error text');
console.log(String(obj.state));    // 'error'
console.log(obj.state.data);       // 'Some error text'
```

Можно заметить, что если явно не преобразовывать значение состояния в строковый тип, то оно выводится в "странном" виде. 
Несмотря на то, что код состояния задается строкой, его значение хранится как объект (поэтому `obj.state` оборачивается в `String`, чтобы вывести значение как строку). Строковое значение оборачивается в `Object` для того, чтобы можно было добавить свойство `data` (данные состояния). При этом к такому значению хорошо применимы операторы сравнения `==` и `!=` в контексте сравнения со строковым значениями (значение `state` неявно приводится к строке), однако не работает с операторами эквивалентного сравнения `===` и `!==`.

```js
obj.state == basis.data.STATE.ERROR;          // true
obj.state != basis.data.STATE.ERROR;          // false
obj.state === basis.data.STATE.ERROR;         // false
obj.state !== basis.data.STATE.ERROR;         // true
String(obj.state) === basis.data.STATE.ERROR; // true
```

Когда меняется состояние (его значение и/или данные), выбрасывается событие `stateChanged`. Аргументом события является предыдущее значение состояния.

```js
basis.require('basis.data');

var obj = new basis.data.AbstractData({
  handler: {
    stateChanged: function(sender, oldState){
      console.log('Previous state:', String(oldState), oldState.data);
      console.log('Current state:', String(this.state), this.state.data);
    }
  }
});

obj.setState(basis.data.STATE.ERROR, 'Error message');
  // В консоли будет выведено:
  // Previous state: 'undefined' undefined
  // Current state: 'error' 'Error message'
```

Для упрощения выставления состояния в `DEPRECATED` используется метод `deprecate`, который переводит объект в состояние `DEPRECATED` только в том случае, если объект не находится в состоянии `PROCESSING`.

### Подписка

Механизм подписки позволяет создавать объекты (источник данных) с определенной логикой синхронизации, но процесс синхронизации иницировать не сразу, а только тогда, когда эти данные станут нужны какому-либо другому объекту (подписчику). Другими словами, механизм подписки обеспечивает возможность одному объекту уведомить другой объект, что он заинтересован в его данных.

Процесс подписки и отписки автоматизирован и управляется свойствами `active` и `subscribeTo`.

```js
var source = new basis.data.Object({
  handler: {
    subscribersChanged: function(sender, delta){
      if (delta > 0)
        console.log('source: I\'m helpful, somebody use me');
      else
        console.log('source: I\'m useless, nobody use me');
    }
  }
});

var subscriber = new basis.data.Object({
  subscribeTo: basis.data.SUBSCRIPTION.DELEGATE,
  delegate: source
});

subscriber.setActive(true);
// console> source: I\'m helpful, somebody use me
// console> true

subscriber.setActive(false);
// console> source: I\'m useless, nobody use me
// console> true
```

Если объект-потребитель данных активен (свойство `active` равно `true`, в примере это `subscriber`), то для объектов, которые хранятся в свойствах, перечисленных в `subscribeTo`, счетчик заинтересованных объектов (свойство `subscriberCount`) увеличивается на единицу. Когда объект перестает быть активным (`active` -> `false`), счетчики объектов, на которые он был подписан, уменьшаются на единицу. То же происходит, когда потребитель (`subscriber`) перестает ссылаться на источник (в примере это `source`).

```js
var Data = basis.data.Object.subclass({
  emit_subscribersChanged: function(delta){
    basis.data.Object.prototype.emit_subscribersChanged.call(this, delta);
    console.log(this.name, delta > 0 ? 'started to be in use' : 'stopped to be used');
  }
})
var a = new Data({ name: 'source A' });
var b = new Data({ name: 'source B' });

var subscriber = new basis.data.Object({
  // по умочанию subscribeTo: basis.data.SUBSCRIPTION.DELEGATE + basis.data.SUBSCRIPTION.TARGET
  active: true,
  delegate: a  // subscriber ссылается на `a` свойством `delegate`
});
// console> source A started to be in use

subscriber.setDelegate(b);
// console> source A stopped to be used
// console> source B started to be in use
// console> true

subscriber.setDelegate();
// console> source B stopped to be used
// console> true
```

При появлении у объекта данных (в примере это `source`) первого подписчика или когда отписывается последний подписчик (свойство `subscriberCount` становится равным 0), выбрасывается событие `subscribersChanged`. Обработчики этого события получают в качестве единственного аргумента одно из двух значений:

  * 1 - появился первый подписчик (`subscriberCount` == 1);

  * -1 - отписался последний подписчик (`subscriberCount` == 0).

Обычно объекты синхронизируют свои данные с сервером, только когда имеют подписчиков, то есть активных потребителей данных, которые ссылаются на них одним из своих свойств, определенных в `subscribeTo`.

Свойство `active` определяет, является ли объект активным подписчиком (включает механизм). Свойство может быть задано при создании объекта или изменено позже методом `setActive`. Когда это свойство меняется, выбрасывается событие `activeChanged`. По умолчанию все объекты пассивны (`active` равно `false`).

То, на какие объекты влияет объект (вернее, в каких свойствах они хранятся), определяет свойство `subscribeTo`. Свойство может быть задано при создании объекта или изменено позже методом `setSubscription`. При изменении значения свойства событий не выбрасывается.

> Не известны кейсы, когда было бы необходимо получать событие на изменение свойства `subscribeTo`.
> На практике это свойство не изменяется в течении жизненного цикла объекта, поэтому есть вероятность того, что метод `setSubscription` будет убран, а задать `subscribeTo` можно будет только при создании объекта.

Специальный объект `basis.data.SUBSCRIPTION` регистрирует свойства объектов (название), которые доступны для подписки, и генерирует для них код. Такие поля должны ссылаться на экземпляры класса `basis.data.AbstractData`. Код свойства – это числовое значение, которое определяется единственным битом на определенной позиции. Таким образом, чтобы определить подписку на несколько свойств, необходимо сложить соответствующие свойству коды (или использовать оператор бинарного "или" `|`):

```js
var example = basis.data.AbstractData.subclass({
  subscribeTo: basis.data.SUBSCRIPTION.FOO + basis.data.SUBSCRIPTION.BAR,

 /**
  * @type {basis.data.AbstractData}
  */ 
  foo: null,

 /**
  * @type {basis.data.Object}
  */
  bar: null
});
```

Пример регистрации нового свойства, доступного для подписки:

```js
// простой случай
basis.data.SUBSCRIPTION.addProperty('foo');
// после этого будет доступно константное значение
// для этого поля basis.data.SUBSCRIPTION.FOO

basis.data.SUBSCRIPTION.add(
  // название кода
  'BAR',

  // хендлер, отслеживающий изменения свойства, ссылающееся
  // на объект подписки (source)
  {
    barChanged: function(subscriber, oldBar){
      if (oldBar)
        // subscriber отписываемся от oldBar
        basis.data.SUBSCRIPTION.unlink('bar', subscriber, oldBar);

      if (subscriber.bar)
        // subscriber подписывается на subscriber.bar
        basis.data.SUBSCRIPTION.link('bar', subscriber, subscriber.bar);
    }
  },

  // функция вызывается при активации/деактивации механизма подписки
  // action – это либо basis.data.SUBSCRIPTION.link, либо basis.data.SUBSCRIPTION.unlink
  function(action, subscriber){
    if (subscriber.bar)
      action('bar', subscriber, subscriber.bar);
  }
);
```

В basisjs определены следующие свойства (в скобках указано событие, по которому проверяется значение).

  * basis.data:

    * DELEGATE - свойство delegate (delegateChanged);
    * TARGET - свойство target (targetChanged);
    * DATASET - свойство dataset (datasetChanged).

  * basis.data.dataset:

    * SOURCE - свойство source (sourceChanged) и элементы свойства sources (sourcesChanged);
    * MINUEND - свойство minuend (minuendChanged);
    * SUBTRAHEND - свойство subtrahend (subtrahendChanged).
  
  * basis.dom.wrapper:

    * DATASOURCE - свойство dataSource (dataSourceChanged);
    * OWNER - свойство owner (ownerChanged).


### Абстрактная синхронизация

В `basis.data.AbstractData` не описаны конкретные действия по синхронизации (поэтому абстрактная), а лишь реализован механизм для упрощения ее организации.

Сам механизм представлен свойствами:

  * isSyncRequired – метод, возвращающий булево значение, необходима ли синхронизация (по сути, правило). По умолчанию синхронизация требуется, если у объекта более одного подписчика и его состояние `UNDEFINED` или `DEPRECATED`.

  * syncEvents – список событий, при наступлении которых делается проверка необходимости синхронизации (вызывается метод `isSyncRequired`).

  * syncAction – метод, описывающий действия синхронизации. По умолчанию не задан (свойство равно `null`). Если свойство не задано, механизм синхранизации не будет активирован.

Для того чтобы активировать механизм синхронизации, необходимо задать свойство `syncAction`. Оно может быть задано при создании экземпляра либо после создания методом `setSyncAction`. Метод `setSyncAction` принимает единственный параметр – новую функцию синхронизации. Если методу передано значение, которое не является функцией, `syncAction` приравнивается `null`, а сам механизм синхронизации деактивируется.

```js
basis.require('basis.data');

var example = new basis.data.AbstractData({
  syncAction: function(){
    console.log('sync requested');
  }
});
```

Но определения `syncAction` недостаточно, для того чтобы объект начал синхронизацию. Необходимо чтобы выполнялось условие определенное в методе `isSyncRequired`. Для `AbstractData` этот метод определен так:

```js
basis.data.AbstractData.prototype.isSyncRequired = function(){
  return this.subscriberCount > 0 && 
         (this.state == STATE.UNDEFINED || this.state == STATE.DEPRECATED);
};
```

Таки образом для инициации синхронизации необходимо чтобы у объекта был хотя бы один подписчик и он находился в состоянии `UNDEFINED` или `DEPRECATED` и это условие удовлетворяет большинству ситуаций возникающих при создании интерфейса. Для выполнения синхронизации из предыдущего примера не хватает подписчика. Обычно подписчиком является некоторое представление или другой объект, использующий данный в качестве источника данных - то есть, в любом случае, это некоторый стороний объект заинтересованный в том, чтобы данный объект был сихронизирован.

Для того чтобы инициировать синхронизацию сразу при создании экземпляра, можно переопределить метод `isSyncRequired`:

```js
basis.require('basis.data');

// по умолчанию экземпляр создается в состоянии UNDEFINED
var example = new basis.data.AbstractData({
  isSyncRequired: function(){
    return this.state == basis.data.STATE.UNDEFINED;
  },
  syncAction: function(){
    console.log('sync requested');
  }
});
// console> sync requested
```

Обычно в `syncAction` выполняется запрос к серверу для получения данных, а синхронизация инициируется при привязке объекта данных к активному представлению:

```js
basis.require('basis.data');
basis.require('basis.ui');

var example = new basis.data.Object({
  syncAction: function(){
    var self = this;
    basis.net.request('/api/whatever',
      // success
      function(data){
        self.update(data);
        self.setState(basis.data.STATE.READY);
      },
      // failure
      function(error){
        self.setState(basis.data.STATE.ERROR, error);
      }
    );
  }
});

var view = new basis.ui.Node({
  active: true,
  delegate: example
});
```

Для упрощения работы с запросами и сменой состояний используется модуль `basis.net.action`. Предыдущий пример может быть переписан следущим образом:

```js
basis.require('basis.data');
basis.require('basis.ui');

var example = new basis.data.Object({
  syncAction: basis.net.action.create({
    url: '/api/whatever',
    success: function(data){
      this.update(data);
    }
  })
});

var view = new basis.ui.Node({
  active: true,
  delegate: example
});
```

Более того сами представления, точнее экземпляры `basis.dom.wrapper.Node`, могут получать данные без использования других объектов. Это подходит для простых случаев, когда данные не переиспользуются (но все же рекомендуется получать данные от сервера в объектах данных, а не в представлении) и предыдущий пример может выглядеть так:

```js
basis.require('basis.ui');

var view = new basis.ui.Node({
  syncAction: basis.net.action.create({
    url: '/api/whatever',
    success: function(data){
      this.update(data);
    }
  })
});
```

Для центролизованной работы с сервисом (некоторым серверным API) используются экземпляры `basis.net.service.Service`, которые так же позволяет создавать `action` (используя тот же модуль `basis.net.action`), но с общими настройками по умолчанию, поддержкой сессии и прочим.
