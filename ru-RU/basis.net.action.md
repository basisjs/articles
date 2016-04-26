# basis.net.action

`basis.net.action` используется для создания прозрачного интерфейса между моделью данных приложения и серверным API.

```js
var User = basis.entity.createType('User', {
  id: basis.entity.IntId,
  title: String
});

User.extend({
  save: basis.net.action.create({
    url: '/users',
    method: 'POST',
    request: function(){
      return {
        postBody: JSON.stringify({
          userId: this.getId(),
          title: this.data.title
        })
      };
    },
    success: function(data){
      this.update(data);
    }
  })
});

var user = User(123);
user.set('title', 'John');
user.save();
```

Функция `basis.net.action.create` по переданному конфигу создает экземляр транспорта и возвращает функцию, которая вызывает метод `request` созданного экземпляра. При этом состояние модели синхронизируется с состоянием запроса, так при старте модель переходит в состояние `processing`, при успешном выполнении запроса - в состояние `ready`, а при ошибке - в состояние `error`.

При создании `basis.net.action` в качестве параметров может быть использован следующий набор функций:
  * `request()` - результат функции будет передан в метод `request` транспорта;
  * `prepare()` - вызывается перед отправкой запроса и служит для подготовки данных;
  * `start()` - вызывается при отправке запроса;
  * `success(data)` - вызывается при успешном выполнении запроса;
  * `failure(error)` - вызывается при неудачном выполнении запроса;
  * `abort()` - вызывается при отмене запроса;
  * `сomplete()` - вызывается при завершении запроса независимо от его статуса.

Все перечисленные выше функции вызываются в контексте модели и, следовательно, имеют доступ к ее свойстам и методам.

В функцию `prepare` передаются те же параметры, что были переданы при вызове `basis.net.action`.

```js
User.extend({
  save: basis.net.action.create({
    ...
    prepare: function(newTitle){
      this.set('title', newTitle);
    },
    ...
  })
});

user.save('Anna');
```
