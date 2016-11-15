# Роли

К значимым элементам интерфейса следует добавлять специальные маркеры — роли.
Роль — это альтернатива пути в DOM-дереве, дополнительный семантический уровень у элементов.

Используя роли, разработчики приобретают удобный инструмент для отслеживания поведения пользователей на сайте (трекинг) и автоматического тестирования, независимый от классической разметки.

## Создание
Роли прописываются для элементов с аттрибутами [event](https://github.com/basisjs/articles/blob/ac5d85b39fb45e80cac678df4d47252bac481438/ru-RU/basis.ui_actions.md)

Если в шаблоне описывается уникальный компонент, который точно больше не встретится на этой странице, то нужному элементу можно прописать аттрибут роли с конкретным значением (например, `b:role="brand"`)
Для большинства случаев создается аттрибут `b:role` без значения

```
<input
 type="text"
 class="field"
 b:role

 event-keypress="keypress"
/>
```

В этих случаях значение роли прописывается в js-файле конкретного компонента

```
var fieldAddress = Node.subclass({
    role: 'field-address',
    template: resource('./template/field.tmpl'),
});
```

Для дочерних узлов, которые генерируются в зависимости от количества пришедших данных, в js указывается `roleId`, значением которого в большинстве случаев можно указать биндинг 'id'.

```
module.exports = new menu({
    role: 'menu',
    template: resource('./template/view.tmpl'),
    childClass: {
        role: 'item',
        roleId: 'id',
        template: templates.menuItem,
        binding: {
            id: 'data:'    
        }
    }
});
```

Это позволит сгенерировать множество уникальных ролей для каждого из детей.
       
## Инспектирование ролей

В basisjs-tools есть специальные режимы для работы с ролями — **Roles Pick Inspect** (R с лупой) и **Roles**.

<img src="https://s16.postimg.org/7ioikngo5/basistoolsroles.png" alt="alt text" width="500">

В обоих режимах включается отображение ролей и трекинга на странице, которые подсвечиваются индикаторами определенных цветов:
- серый (1) — роль есть, трекинг не ведётся
- зеленый (2) — роль и трекинг есть
- красный (3) — у элемента есть `event-`, но роли нет

<img src="https://s21.postimg.org/5ijc0zt4n/roles_2.png" alt="alt text" width="500">

#### Roles Pick Inspector
<img src="https://s13.postimg.org/go7atewp3/inspector.png" alt="alt text" height="30">
– детальное инспектирование отдельных ролей

TODO особенности

#### Roles
<img src="https://s21.postimg.org/xbntmlqyv/roles3434.png" alt="alt text" height="30">
– базовый режим отображение ролей 

TODO особенности

## Tracking map
TODO

