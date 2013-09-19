# Сортировка

Сортировка используется для автоматического упорядочивания дочерних узлов. Для этого используется функция, которая вычисляет некоторое значение на основании переденного ей узла. Эти значения используются для определения порядка в массиве `childNodes` родителя.

## Принцип работы

Для задания сортировки при создании узла используются свойства `sorting` и `sotringDesc`. Первое определяет функцию вычисления значения, по которому осуществляется сортировка, а второе – направление сортировки. В дальнейшем настройки сортировки можно изменить методом `setSorting`, которому передаются новые значения `sorting` и `sortingDesc`. Если направление не задано (параметр `sortingDesc`), то назначается сортировка по возрастанию. При изменении сортировки и/или его направления выбрасывается событие `sortingChanged`, аргументами которого являются значения `sorting` и `sortingDesc` до изменения.

Значение свойства `sorting` перед присвоением всегда оборачивается с помощью `basis.getter`, таким образом в качестве нового значения можно указать строку или функцию. Если передается `null`, то значением свойства будет `basis.fn.nullGetter`, что означает – сортировка не применяется.

По умолчанию сортировка осуществляется по возрастанию (`sortingDesc` равно `false`).

```js
var node = new basis.dom.wrapper.Node({
  sorting: 'data.value',
  sortingDesc: true,
  handler: {
    sortingChanged: function(sender, oldSorting, oldSortingDesc){
      console.log('sorting changed:', this.sorting !== oldSorting);
      console.log('sorting direction changed:', this.sortingDesc !== oldSortingDesc);
    }
  }
});

node.setSorting(function(child){
  return child.data.somethingElse;
});
// console> sorting changed: true
// console> sorting direction changed: true

node.setSorting();
// console> sorting changed: true
// console> sorting direction changed: false

console.log(node.sorting === basis.fn.nullGetter);
// console> true
console.log(node.sortingDesc);
// console> false
```

Когда применяется сортировка, методы `appendChild` и `insertBefore` не могут влиять на положение дочернего узла, оно выбирается согласно сортировке. Другими словами, эти методы могут лишь добавить новый узел. Вызов этих методов для узлов, которые уже находятся в `childNodes` приводит к перепроверке позиции и, возможно, к перемещению на правильную позицию.

На данный момент, положение дочернего узла определяется при его вставке новому родителю с сортировкой и перепроверяется при возникновении у него события `update`. В случае, если другие условия влияют на порядок дочерних узлов и это не сопровождается событием `update`, можно использовать методы `appendChild` или `insertBefore` для актуализации позиции.

```js
// ... некоторые изменения в child, которые могут повлиять на позицию

if (child.parentNode)
  child.parentNode.appendChild(child); // расположит child на правильной позиции
```

При отключении сортировки, дочерние узлы остаются в том же порядке, в каком они были до отключения сортировки.
