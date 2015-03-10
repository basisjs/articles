# Сортировка

Сортировка используется для автоматического упорядочивания дочерних узлов. Для сортировки задается функция, которая вычисляет значение для переданного ей узла. Такие значения используются для определения порядка в массиве `childNodes`. Так же можно задать направление сортировки - по возрастанию или по убыванию.

Настройки сортировки хранится в свойствах `sorting` и `sortingDesc`. Первое определяет функцию для вычисления значения, а второе – направление сортировки. В дальнейшем настройки сортировки можно изменить методом `setSorting(sorting, sortingDesc)`. По умолчанию сортирка осуществляется по возврастанию (`sortingDesc` равно `false`), это же направление будет, если не задавать параметр `sortingDesc` при вызове метода `setSorting`.

При изменении сортировки или его направления выбрасывается событие `sortingChanged`, аргументами которого являются значения `sorting` и `sortingDesc` до изменения.

```js
var list = new basis.dom.wrapper.Node({
  sortingDesc: true,         // установить сортировку по убыванию
  sorting: function(child){
    return child.data.value;
  },
  handler: {
    sortingChanged: function(sender, oldSorting, oldSortingDesc){
      console.log('sorting changed:', this.sorting !== oldSorting);
      console.log('sorting direction changed:', this.sortingDesc !== oldSortingDesc);
    }
  }
});

// инвертировать текущую сортировку
list.setSorting(list.sorting, !list.sortingDesc);
// console> sorting changed: false
// console> sorting direction changed: true

// устанавить новую сортировку
// сортировка по возрастанию, так как направление не задано явно
list.setSorting(function(child){
  return child.data.somethingElse;
});
// console> sorting changed: true
// console> sorting direction changed: false
```

Значение свойства `sorting` перед присвоением оборачивается с помощью `basis.getter`. Таким образом, в качестве нового значения можно указать строку или функцию.

```js
var list = new basis.dom.wrapper.Node({
  sorting: 'data.value'   // эквивалентно:
                          // function(child){
                          //   return child.data.value;
                          // }
});

list.setSorting('somethingElse');
// эвивалентно
list.setSorting(function(child){
  return child.somethingElse;
});
```

Если для `sorting` задается значение `null` или `undefined`, то значением свойства будет `basis.fn.nullGetter`, и сортировка не применяется. При отключении сортировки, порядок дочерних узлов сохраняется.

```js
var list = new basis.dom.wrapper.Node({
  sorting: 'data.value'
});

console.log(typeof list.sorting);
// console> function

list.setSorting();

console.log(list.sorting === basis.fn.nullGetter);
// console> true
console.log(typeof list.sorting);
// console> function
```

Когда применяется сортировка, методы `appendChild()`, `insertBefore()` и `setChildNodes()` не могут влиять на положение дочернего узла, они могут лишь добавить новый дочерний узел, но порядок определяется автоматически. Вызов этих методов для узлов, которые уже находятся в `childNodes` приводит к перепроверке позиции и при необходимости к перемещению на правильную позицию.

Положение дочернего узла определяется при его вставке новому родителю с сортировкой и перепроверяется при возникновении у него события `update`. Если на порядок дочерних узлов влияют другие условия и это не сопровождается событием `update`, можно использовать метод `appendChild()` или `insertBefore()` для актуализации позиции.

```js
// ... некоторые изменения в child, которые могут влиять на сортировку

if (child.parentNode)
  child.parentNode.appendChild(child); // расположит child на правильной позиции
```
