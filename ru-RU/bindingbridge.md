# Binding bridge

Механизм `binding bridge` служит для обеспечения простой связи объектов и одностороней синхронизации некоторого значения между ними. Он позволяет абстрагироваться от конкретной реализации класса (объекта), того, что является значением, как оно хранится, как хранятся, добавляются и удаляются обработчики, срабатываюшие на изменение значения.

Считается, что экземпляр (класс) поддерживает данный механизм, если у него есть свойство `bindingBridge`, в котором содержится объект. Этот объект является универсальным интерфейсом и должен предоставлять 3 метода:

  * attach(host, fn, context) - метод для добавления обработчика, где:
    * host - владелец интерфейса;
    * fn - функция-обработчик, которая вызывается, когда значение меняется;
    * context - контекст для обработчика, обычно объект, который привязывается к владельцу интерфейса;

  * detach(host, fn, context) - метод для удаления обработчика;

  * get(host) - метод, возвращающий значение.

> Для корретного удаления обработчика, методу `detach` необходимо передавать те же значения, что и методу `attach`, они должны быть эквивалентны.

Обработчик вызывается в случае изменения значения и ему передается единственный аргумент – новое значение. В этот момент `bindingBridge.get` должен возвращать то же значение.

```js
var token = new basis.Token(123);
var logChanges = function(value){
  console.log('new value is', value, 'and it',
    (token.bindingBridge.get(token) === value ? 'equals' : 'not equals'),
    'to token.bindingBridge.get(token)');
};

token.bindingBridge.attach(token, logChanges);
token.set(333);
// console> new value is 333 and it equals to token.bindingBridge.get(token)

token.bindingBridge.detach(token, logChanges);
token.set(1);
// в консоль ничего выведено не будет
```

> Может возникнуть вопрос, зачем передавать в метод владельца интерфейса и почему не используется `this` внутри методов интерфейса. Дело в том, что методы интерфейса находятся в объекте `bindingBridge` и не будут иметь нужного контекста при обычном вызове. Для задания контекста требуется вызов `token.bindingBridge.attach.call(token, logChanges)`. Можно заметить, что аргументы остались те же, но добавилось `.call`. Текущая реализация не требует `.call` и вызов таких методов оказывается немного короче.

Данный интерфейс широко используется в [шаблонах](basis.template.md) и [биндингах](basis.ui_bindings.md) `basis.ui`.

Список классов предоставляющих интерфейс `binding bridge`:

  * [`basis.Token`](basis.Token.md) и его потомки:
      * [`basis.DeferredToken`](basis.Token.md)
      * `basis.l10n.Token`
      * `basis.template.SourceWrapper`;

  * `basis.data.value.BindValue` и его потомки:
      * `basis.data.value.Property`
      * `basis.data.value.ObjectSet`
      * `basis.data.value.Expression`
      * `basis.data.index.Index`
          * `basis.data.index.Count`
          * `basis.data.index.Sum`
          * `basis.data.index.Avg`
          * `basis.data.index.Min`
          * `basis.data.index.Max`

  * [`basis.template.Template`](basis.template.md) и его потомок [`basis.template.html.Template`](basis.template.md)
