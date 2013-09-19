# Привязка данных

`AbstractNode` наследуется от [basis.data.Object](basis.data.Object.md) и тем самым перенимает все механизмы работы с данными и состоянием. Таким образом узлы интерфейса сами могут выступать в качестве моделей данных.

Данные узла хранятся в свойстве `data`, его состояние в свойстве `state`. Так же широко используется [делегирование](basis.data.Object.md#Делегирование).

## autoDelegate

В дополнение унаследованным свойствам `AbstractNode` вводит дополнительное свойство – `autoDelegate`. Это свойство позволяет автоматизировать делегирование родителя и/или владельца. Возможны несколько значений свойства (определены в `basis.dom.wrapper.DELEGATE`):

  * NONE – нет автоматического делегирования, значение по умолчанию;

  * PARENT – узел должен делегировать своего родителя (`parentNode`);

  * OWNER – узел должен делегировать своего владельца (`owner`);

  * ANY – узел должен делегировать своего родителя или владельца; всегда возможен только один вариант, так как `parentNode` и `owner` не могут быть установлены одновременно (см [parentNode vs. owner](#parentnode-vs-owner)).

Вместо `basis.dom.wrapper.DELEGATE.ANY` можно использовать значение `true`, а вместо `basis.dom.wrapper.DELEGATE.NONE` – `false`.

```js
var autoDelegateNode = new basis.dom.wrapper.Node({
  autoDelegate: true
});
var parent = new basis.dom.wrapper.Node();
var owner = new basis.dom.wrapper.Node();

console.log(autoDelegateNode.delegate);
// console> null

parent.appendChild(autoDelegateNode);
console.log(autoDelegateNode.parentNode === parent);
// console> true
console.log(autoDelegateNode.delegate === parent);
// console> true

parent.removeChild(autoDelegateNode); // если узел не удалить у parent,
autoDelegateNode.setOwner(owner);     // то установка владельца вызовет исключение
console.log(autoDelegateNode.owner === owner);
// console> true
console.log(autoDelegateNode.delegate === owner);
// console> true
```

Делегат назначается при изменении соответствующего свойства (`parentNode` или `owner`), но после этого изменения можно выставить произвольный делегат, используя метод `setDelegate`.

> На данный момент это не ограничивается, но в будущем эта ситуация должна быть разрешена таким образом, чтобы `delegate` и `autoDelegate` оставались согласованы.
