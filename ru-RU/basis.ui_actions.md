# Обратная связь (actions)

Чтобы получать события, которые происходят в DOM шаблона, используется метод `templateAction`. Этот метод получает два параметра: `name` имя действия и `event` - браузерное событие.

> На самом деле `event` не настоящее браузерное событие, а его клон дополненный свойствами и методами. Настоящее событие хранится в его свойстве `event_`.
> Такой подход используется во многих библиотеках, чтобы иметь возможность расширить объект события дополнительными свойствами и методами, т.к. объект `Event` расширять нельзя.

```js
var node = new basis.ui.Node({
  template:
    '<div>' +
      '<button event-click="up">Up</button>' +
      '<button event-click="down">Down</button>' +      
    '</div>',

  templateAction: function(name, event){
    console.log(name, event.type);
  }
});

// как только пользователь нажмет кнопку "Up" в консоли будет
// console> "up" "click"
// для кнопки "Down" в консоли будет
// console> "down" "click"
```

Для удобства добавления обработчиков на определенные действия, используется свойство `action`. Это расширяемое свойство ([extensibeProperty](basis.Class.md#extensibleproperty)), где ключи являются названями действий, а значения - функции-обработчики этих действий, которые получают объект события `event`. Для того, чтобы вызывался определенный обработчик в `basis.ui.Node` метод `templateAction` определен так:

```js
basis.ui.Node.prototype.templateAction = function(actionName, event){
  var action = this.action[actionName];

  if (action)
    action.call(this, event);

  if (!action)
    basis.dev.warn('template call `' + actionName + '` action, but it isn\'t defined in action list');    
};
```

Если обработчик есть в `action`, то он вызывается. Иначе в консоли будет выведено предупреждающее сообщение, так как это скорей всего ошибка в шаблоне или в `action`. В результате такого определения метода `templateAction`, становится просто определять обработчики на определенные действия.

```js
var node = new basis.ui.Node({
  template:
    '<div>' +
      '<button event-click="up">Up</button>' +
      '<button event-click="down">Down</button>' +      
    '</div>',

  action: {
    up: function(event){
      console.log('up', event.type);
    },
    down: function(event){
      console.log('down', event.type);
    }
  }
});
```
