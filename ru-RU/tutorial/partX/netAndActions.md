# Сетевые взаимодействия

Какими бы красивыми мы не делали наши интерфейсы, но самой важной их частью являются данные.
И чтобы эт данные получить соответсвенно необходимо взаимодействовать с сервером.

Для этого в basis есть несколько основных конструкций:

```
basis.require('basis.net.service').Service;
basis.require('basis.entity');
```

С entity мы уже знакомились ранее, но вот сервисы мы видим впервые. Именно они позволяются получать нам данные с сервера и отображать
их в наших компонентах.

Давайте предположим что нам нужно получить данные с сервера о группах пользоватей.
Для этого необходимо сначало создать соответсвующую сущность:

```js
 var UserGroup = entity.createType('UserGroup', {
  groupId: entity.IntId,
  title: String
});
```

Сущность есть но данных в ней нет. Чтобы наполнить ее нужно вызвать setSyncAction.

```js
var service = new Service();

UserGroup.all.setSyncAction(service.createAction({
  url: '../res/data/groups.json',
  success: function(data){
    this.setAndDestroyRemoved(UserGroup.readList(data));
  }
}));
```

Группы есть. Давайте теперь добавим самих пользователей. Как часто в basis бывает мы можем задать способ получения данных еще во
время задания сущности. Это делается вот так.

```js
var User = entity.createType({
  name: 'User',
  fields: {
    userId: entity.IntId,
    group: 'UserGroup',
    title: String
  },
  aliases: {
    groupId: 'group'
  },
  all: { // we also can define settings for all in data type definition
    syncAction: service.createAction({
      url: '../res/data/users.json',
      success: function(data){
        this.setAndDestroyRemoved(User.readList(data));
      }
    })
  }
});
```


Выкимнуть из демкки userlist.html группировку чтобы сконцентрировать внимание именно на моменте получения данных и как там че деприкейтится.
Пример групировки рассмотреть отдельно и возможно пример переписать.
