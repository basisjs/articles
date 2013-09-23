# basis.ui

Модуль `basis.ui` является базой для постоения интерфейса. Основной класс которых он предоставляет – `basis.ui.Node`. По сути, пользовательский интерфейс представляет собой одно большое дерево экземпляров `basis.ui.Node` и его потомков.

Большую часть функциональности `basis.ui.Node` наследует от своих потомком, которые определенные слои функциональности. Классы предки в порядке наследования и предоставляемая функциональность:

  * [basis.event.Emitter](basis.event.md)
  * [basis.data.AbstractData](basis.data.md)
  * [basis.data.Object](basis.data.Object.md)
  * [basis.dom.wrapper.AbstractNode](basis.dom.wrapper.md)
  * [basis.dom.wrapper.Node](basis.dom.wrapper.md)

`basis.ui.Node` к этому стеку добавляет возможность [привязки шаблона](basis.ui_template.md) и взаимодействия с ним посредством [биндингов](basis.ui_bindings.md) и [действий](basis.ui_actions.md).

Так же в `basis.ui` допределяет классы `basis.dom.wrapper.GroupingNode` и `basis.dom.wrapper.PartitionNode` для работы с шаблонами, образуя `basis.ui.GroupingNode` и `basis.ui.PartitionNode`.
