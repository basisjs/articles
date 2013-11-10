# basis.net.service

`basis.net.service.Service` является фабрикой объектов `basis.net.Transport`, имеющих общий механизм формирования запроса и обработки его результатов. Обычно используется для реализации серверного взаимодействия с сервисами, имеющих определенные правила и требования для каждого запроса, например, наличие определенных заголовков, определенный формат ответов или необходимость авторизации с последующей подписью каждого запроса, полученным ключом. В одном приложение может использоваться несколько экземпляров `basis.net.service.Service`.

При создании `basis.net.service.Service` используется свойство `transportClass`, которое определяет какой класс будет использоваться для экземпляров `basis.net.Transport`, создаваемых с помощью `basis.net.service.Service`. `transportClass` - это авторасширяемое свойство, в котором по умолчанию иcпользуется класс `basis.net.AjaxTransport`.

```js
var service = new basis.net.service.Service({
  transportClass: {
    requestHeaders: {
      Accept: 'application/json'
    },
    requestClass: {
      getResponseData: function(){
        return this.data.responseText.toObject();
      }
    }
  }
});
```

В примере создается сервис, который для всех запросов будет подставлять http-заголовок `Accept: 'application/json'` и автоматически преобразовывать полученный ответ в `JSON`.
У экземпляра `basis.net.service.Service` доступны методы `createTransport` и `createAction`, с помощью которых можно создавать экземпляры `tranportClass` и функции `basis.net.action` на основе `transportClass` соответсвенно

```js
var transport = service.createTransport({
  url: '/users',
  handler: {
    success: function(){ ... }
  }
});

или

User.extend({
  save: service.createAction({
    url: '/users',
    request: function(){ ... }
    success: function(data){ ... }
  })
});
```

Также в `basis.net.service.Service` предусмотрен механизм для работы с сессиями приложения и подписи запросов. Подписью может быть определенный http-заголовок или параметр, передаваемый с каждым запросом к серверу.

Методы `basis.net.service.Service` для работы с сессией:
  
  * openSession(sessionKey, sessionData) - открывает сессию, после чего можно делать серверные вызовы с подписью;
  * closeSession - закрывает сессию, после чего серверные вызовы, требующие подписи, станут невозможными.

При создании `basis.net.service.Service` доступны методы:

  * signature(transport, sessionData) - функция, которая вызывается при формировании запроса и служит для подписи запроса.
  * isSessionExpiredError(request) - функция, которая по ответу сервера вычисляет, что запрос вернул ошибочный статус из-за истекшей сессии. Если функция возвращает `true` все активные запросы приостанавливаются и сессия закрывается. После восстановления сессии все приостановленные запросы будут перезапущены.

```js
var service = new basis.net.service.Service({
  signature: function(transport, sessionData){
    transport.setParam('sessionKey', sessionData.key);
  },
  isSessionExpiredError: function(request){
    return request.data.error.code == 'SESSION_EXPIRED';
  }
});

...

// получение ключа сессии из cookies
var sessionKey = basis.ua.cookies.get('sessionKey'); 

// открытие сессии сервиса
service.openSession(sessionKey, { key: sessionKey }); 

// вызов серверных методов
var transport = service.createTransport({
  url: '/users',
  handler: {
    success: function(){ ... }
  }
});
transport.request();

service.closeSession();
```