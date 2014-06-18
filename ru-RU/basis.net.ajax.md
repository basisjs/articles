# basis.net.ajax

Модуль обеспечивает базовую работу с `ajax`-запросами, предоставляет два класса `Request` и `Transport`, а так же функцию `request`.

## Transport и Request

Класс `Request` наследуется от `basis.net.Request` и является оберткой над `XMLHttpRequest`. Класс `Transport` наследуется от `basis.net.AbstractRequest`, создает экземпляры `Request` и управляет ими.

Для экземпляра `Transport` заются параметры:

  - `asynchronous` - асинхронное выполнение запроса (по умолчанию `true`)
  - `method` - `HTTP`-метод (по умолчанию `GET`)
  - `contentType` - (по умолчанию `application/x-www-form-urlencoded`)
  - `encoding` - кодировка
  - `requestHeaders` - базовые заголовки для запроса
  - `responseType` - тип ответа (`XMLHttpRequest#responseType`)
  - `url` - адрес для запроса
  - `params` - список параметров, дополняющий в `queryString`
  - `routerParams` - объект, значения которого используются для подстановок в `url`
  - `postBody` - тело запроса (строка или `XML`)

Все эти значения используются как базовые, если они не указаны в параметрах запроса. Значения `params` подмешиваются к `params` запроса, `routerParams` к `routerParams`, а `requestHeaders` к `headers`. Все эти значения можно задать (переопределить) при выполнении запроса методом `request`, который принимает объект со значениями.

```js
var Transport = basis.require('basis.net.ajax').Transport;

var transport = new Transport({
  url: '/users',
  method: 'GET',
  handler: {
    success: function(transport, result, request){
      // обработка успешного выполнения запроса
    },
    failure: function(transport, error){
      // обработка неудачного выполнения запроса
    }
  }
});

transport.request({
  params: {
    userId: 123
  }
});
// будет выполнен асинхронный GET запрос /users?userId=123
```

Для выполнения запроса используется метод `request`. Метод принимает один параметр - это объект, в котором можно указать дополнительные параметры запроса или переопределить параметры экземпляра `Transport` (те, что описаны выше).

Классы обладают дополнительным событием `readyStateChanged`, которое срабатывает при изменениии `readyState` у `XMLHttpRequest`.

В остальном работа классов сводится к общим [принципам работы](basis.net.md) `basis.net` модулей.

[TODO: timeout/response processing/prepare/repeat]

## basis.net.ajax.request

Также можно использовать специальную функцию-хелпер `basis.net.ajax.request` для создания и немедленного выполнения запроса. Эта функция удобна для простых одноразовых запросов.

Данная функция создает объект `Transport`, добавляет ему обработчики, выполняет запрос с указанными параметрами, а по завершению запроса разрушает транспорт. Функция принимает три параметра:

- `config` - конфигурация для `Transport`
- `successCallback` - функция, выполняемая в случае успешного запроса
- `failureCallback` - функция, выполняемая в случае ошибки или когда запрос прерван

В качестве конфигурации можно задавать строку, которая будет `url` транспорта. В этом случае, если не указывается `successCallback` и `failureCallback`, то запрос выполняется синхронно, что удобно в простых случаях:

```js
// синхронный запрос
var data = basis.net.ajax.request('/data.json');

// асинхронный запрос
basis.net.ajax.request('/data.json', function(data){
  // data содержит тело ответа
});
```

В случае, когда первым параметром передается объект, запрос выполняется со значениями по умолчанию, асинхронно.

```js
basis.net.ajax.request({
  url: '/users',
  params: {
    userId: 123
  },
  handler: {
    sucess: function(transport, data){
      console.log('response data', data);
    },
    failure: function(transport, error){

    }
  }
});
```
