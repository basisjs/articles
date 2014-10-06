# basis.ui

Модуль `basis.ui` является базой для постоения интерфейса. Основной класс которых он предоставляет – `basis.ui.Node`. По сути, пользовательский интерфейс представляет собой одно большое дерево экземпляров `basis.ui.Node` и его потомков.

Большую часть функциональности класс `basis.ui.Node` наследует от своих потомком, которые предоставляют определенные слои функциональности. Рекомендуется изучить эти классы перед тем как приступать к разработке на `basis.js`.

Классы предки в порядке наследования и их функциональность:

  * [basis.event.Emitter](basis.event.md) – события (паттерн observer);
  * [basis.data.AbstractData](basis.data.md) – состояние, подписка, абстрактная синхронизация;
  * [basis.data.Object](basis.data.Object.md) – хранение данных, делегирование;
  * [basis.dom.wrapper.AbstractNode](basis.dom.wrapper.md) – модель DOM и ее дополнения, паттерн "владелец", сателлиты;
  * [basis.dom.wrapper.Node](basis.dom.wrapper.md) – сортировка, группировка, работа с выделением, доступность, привязка данных.

`basis.ui.Node` к этому стеку добавляет возможность [привязки шаблона](basis.ui_template.md) и взаимодействия с ним посредством [биндингов](basis.ui_bindings.md) и [действий](basis.ui_actions.md).

Так же в `basis.ui` определены классы `basis.dom.wrapper.GroupingNode` и `basis.dom.wrapper.PartitionNode` для работы с шаблонами, которые унаследованы от `basis.ui.GroupingNode` и `basis.ui.PartitionNode` соответственно.
