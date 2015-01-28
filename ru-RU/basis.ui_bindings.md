# Биндинги (bindings)

Биндинги – это набор значений, которые доступны для использования в шаблоне. Они сохраняются в свойстве `binding`. Это [автораширяемое](basis.Class.md#extensibleProperty) поле, поэтому при создании класса производного от `basis.ui.Node` или экземпляра этих классов, новое значение не перезаписывает старое, а дополняет.

Биндинг представляет из себя функцию, которая принимает единственный параметр `node` – владелец шаблона, для которого вычисляется значение. Результат выполнения такой функции передается шаблону. Функция не должна иметь побочного эффекта, то есть не должна что-то менять в объектах.

```js
var Foo = basis.ui.Node.subclass({
  template: basis.resource('./path/to/template.tmpl'),
  binding: {
    value: function(node){   // теперь шаблон может использовать {value}
      return node.value;
    }
  }
});
```

Функция биндинга вычисляется сразу после создания экземпляра шаблона, но только в том случае если шаблон использует биндинг. По этой причине не важно количество биндингов, вычиляться будут только используемые.

```js
var node = new basis.ui.Node({
  template: '<span>{used}</span>',
  binding: {
    used: function(){
      console.log('"used" binding calculated');
      return true;
    },
    unused: function(node){
      console.log('"unused" binding calculated');
      return true;
    }
  }
});
// console> "used" binding calculated
```

В случае, если что-то поменялось и нужно перевычислить значение биндинга, необходимо вызвать метод `updateBind`, которому передается имя биндинга. Если изменения сопровождаются событием (событиями) можно указать это в описании биндинга (для этого используется расширенная форма) и избавиться от самостоятельного вызова `updateBind`. В этом случае биндинг будет вычисляться (если используетя шаблоном) при создании шаблона и при возникновении событий из указанного списка.

```js
var Foo = basis.ui.Node.subclass({
  template: basis.resource('./path/to/template.tmpl'),
  binding: {
    value: function(node){       // простая запись, без указания событий;
      return node.value;         // для обновления используем updateBind
    },
    selected: {                  // расширенная форма
      events: 'select unselect', // указываем список событий
      getter: function(node){    // функция вычисления значения
        return node.selected;
      }
    },
    disabled: {
      events: ['disable', 'enable'],   // список событий можно указать как массив строк
      getter: function(node){
        return node.isDisabled();
      }
    },
    title: ['update', function(node){  // еще один возможный вариант описать биндинг с событием
      return node.data.title;
    }]
  },
  setValue: function(){
    this.value = value;
    this.updateBind('value');
  }
});
```

Так же в качестве описания биндига принимаются некоторые специальные значения:

  * объект поддерживающий механизм [`binding bridge`](bindingbridge.md) – значение отдается в шаблон как есть;

    ```js
      // экземпляры basis.data.Value имеют интерфейс bindingBridge
      var count = new basis.data.Value({ value: 123 });

      var node = basis.ui.Node({
        binding: {
          count: count,   // эквивалентно
                          // count: function(){
                          //   return count;
                          // }
          double: count.as(function(value){  // метод as возвращает basis.Token, который
            return value * value;            // тоже поддерживает механизм binding bridge
          })
        }
      });
    ```
  
  * строка – используется, если возможно, преобразование [сокращения](#Сокращения), иначе значение оборачивается в basis.getter;

    ```js
      var node = basis.ui.Node({
        binding: {
          value: 'value'  // эквивалентно
                          // value: basis.getter('value')
        }
      });
    ```

  * экземпляр `basis.ui.Node` – при первом вычислении экземпляр добавляется в список `satellite` узла, а в шаблон отдается значение его свойства `element`.

    ```js
      var satelliteNode = new basis.ui.Node();
      var node = basis.ui.Node({
        binding: {
          foo: satelliteNode  // эквивалентно
                              // foo: {
                              //   events: 'satelliteChanged',
                              //   getter: function(node){
                              //     node.setSatellite('foo', satelliteNode);
                              //     return node.satellite.foo
                              //       ? node.satellite.foo.element
                              //       : null;
                              //   }
                              // }
        }
      });
    ```

## Сокращения

Для наиболее частых типов биндингов используется специальная запись в виде строки (сокращение), которая позволяет сократить количество кода для описания биндинга. Такие строки имеют некоторый префикс вида `"название:"`, а все что идет после него используется как значение.

В модуле `basis.ui` определены два типа сокращения:

  * data – предназначен для упрощения прокидывания полей из свойства `data` в шаблон;

    ```js
      var node = basis.ui.Node({
        data: {
          age: 123
        },
        binding: {
          foo: 'data:age',   // эквивалентно
                             // foo: {
                             //   events: 'update',
                             //   getter: basis.getter('data.age')
                             // }
          age: 'data:'       // если имя биндинга совпадает с именем
                             // поля в data, то название поля можно опустить
        }
      });
    ```

  * satellite – предназначен для упрощения прокидывания корневого элемента сателлита в шаблон;

    ```js
      var node = basis.ui.Node({
        binding: {
          foo: 'satellite:name',   // эквивалентно
                                   // foo: {
                                   //   events: 'satelliteChanged',
                                   //   getter: function(node){
                                   //     return node.satellite['name']
                                   //       ? node.satellite['name'].element
                                   //       : null;
                                   //   }
                                   // }
          bar: 'satellite:'        // если имя биндинга совпадает с именем сателлита,
                                   // то его название в описании биндинга можно опустить
        }
      });
    ```

Управляет сокращениями объект `basis.ui.BINDING_PRESET`, который позволяет добавлять новые сокращения методом `add` при необходимости. Новые сокращения должны быть добавлены до первого объявления биндинга такого типа.

## Биндинги по умолчанию

Для `basis.ui.Node` и `basis.ui.PartitionNode` определен ряд биндигов, которые доступны по умолчанию (в скобках указаны события):

  * state (stateChanged) – возвращает строковое значение свойства `state`;

  * childNodesState (childNodesStateChanged) – возвращает строковое значение свойства `childNodesState`;
  
  * childCount (childNodesModified) – возвращает число дочерних узлов;
  
  * hasChildren (childNodesModified) – возвращает `true` если есть дочерние узлы и `false` в ином случае;
  
  * empty (childNodesModified) – возвращает `true` если нет дочерних узлов и `false` в ином случае;

Для `basis.ui.Node` так же определены дополнительные биндинги:

  * selected (select, unselect) – возвращает `true`, если узел выбран (`selected` == `true`), иначе `false`;

  * unselected (select, unselect) – возвращает `true`, если узел не выбран, иначе `false`;

  * disabled (disable, enable) – возвращает `true`, если узел заблокирован (`node.isDisabled()` == `true`), иначе `false`;

  * enabled (disable, enable) – возвращает `true`, если узел не заблокирован, иначе `false`;

> В будущем планируется изменить цепочку наследования для `basis.ui.PartitionNode` и набор биндингов будет одинаковым.
