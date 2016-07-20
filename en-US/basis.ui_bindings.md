# Bindings

## Shortcuts

## Default bindings

There is a list of default bindings for `basis.ui.Node` and `basis.ui.PartitionNode` classes (events are mentioned in brackets):

  * state (stateChanged) returns `state` property as a string;

  * childNodesState (childNodesStateChanged) returns `childNodesState` property as a string;

  * childCount (childNodesModified) returns number of child nodes;

  * hasChildren (childNodesModified) returns `true` there is at least one child node and `false` otherwise;

  * empty (childNodesModified) returns `true` if there is no child nodes and `false` otherwise;

There are few more default bindings for `basis.ui.Node` class:

  * selected (select, unselect) returns `true` if the node is selected  (`selected` == `true`), `false` otherwise;

  * unselected (select, unselect) returns `true` if the node is _not_ selected, `false` otherwise;

  * disabled (disable, enable) returns `true` if the node is disabled (`node.isDisabled()` == `true`), `false` otherwise;

  * enabled (disable, enable) returns `true` if the node is _not_ disabled `false` otherwise;

> There are plans to change the inheritance chain for `basis.ui.PartitionNode`. After that the list of default bindings willbe the same as for `basis.ui.Node`.
