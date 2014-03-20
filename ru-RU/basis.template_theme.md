# Темы

Тема позволяет определить набор описаний шаблонов, которые должны быть применены когда она используется.

Функция `basis.template.theme(name)` возврашается интерфейс темы. Если темы с таким именем еще нет, то она создается. Если имя не задано, возвращается базовая тема.

```js
console.log(basis.template.theme('myTheme'));
// console> basis.template.Theme { name: 'myTheme', .. }
```

Тема ассоциирует описания с некоторыми именами. В дальнейшем эти имена используются в коде и описаниях шаблонов, в качестве ссылки на описание. Для ассоциации используется метод темы `define`.

```js
basis.template.theme('myTheme').define('foo.bar.baz', resource('./path/to.tmpl'))

var node = new basis.ui.Node({
  template: basis.template.get('foo.bar.baz')
});

var myButton = basis.ui.button.Button.subclass({
  template: '<b:include src="basis.ui.button.Button" class="my-button"/>'
});
```

Не зависимо от того в какой теме определено имя, это имя добавляется в общий список. Функция `basis.template.get` так же регистрирует имя и, таким образом, можно привязывать шаблон по имени, еще до его определения.

Метод `define` и функция `basis.template.get` при регистрации новых имен создают экземпляры класса `basis.template.SourceWrapper`. К ним и привязываются шаблоны, используя их в качестве источника описания. Значением описания у таких экземпляров является описание заданое в текущей теме. Если в текущей теме за именем не закреплено описания, то используется `fallback`.

Иначально всегда существует базовая тема, с именем `base`. По умолчанию, все темы делают `fallback` на нее, если используется некоторое именнованное описание, которое не определено в самой теме. Если и в базовой теме за именем не закреплено описания, то в качестве описания используется пустая строка.

Темы могут определить список и порядок других тем, в случае, если в теме за именем не закреплено описания. Эта настройка выполняется методом `fallback`, которому передается строка - список тем разделенных `/`. В случае отсутсвия описания у темы, описание будет искаться в других темах в указаном порядке. Вне зависимости от указанного списка тем, если в них не найдено описания, то описание будет браться из базовой темы.

```js
basis.template.theme('base').define('example', 'base');
basis.template.theme('a').define('foo.bar', 'a');
basis.template.theme('b').define('baz', 'b');
basis.template.theme('c').fallback('b/a');

// текущая тема `c`

console.log(basis.template.get('example').value);
// console> "base"

console.log(basis.template.get('foo.bar').value);
// console> "a"

console.log(basis.template.get('baz').value);
// console> "b"

console.log(basis.template.get('not.exists').value);
// console> ""
```

Если меняется `fallback` темы или в теме из списка добавляется описание для некоторого имени, то значение описания для этого перевычисляется.

```js
basis.template.theme('a').define('foo.bar', 'a');
basis.template.theme('c').fallback('b/a');

var source = basis.template.get('foo.bar');

// текущая тема `c`

console.log(source.value);
// console> "a"

basis.template.theme('b').define('foo.bar', 'b');
console.log(source.value);
// console> "b"

basis.template.theme('c').define('foo.bar', 'c');
console.log(source.value);
// console> "c"
```

Метод `define` имеет несколько сигнатур вызова:

  * define(name, source) – определяет описание `source` для имени `name`;

    ```js
    var res = basis.template.theme('foo').define('foo.bar', 'some content');

    console.log(res);
    // console> basis.template.SourceWrapper { .. }
    ```

  * define(namespace, object) – задает список описаний, используя `namespace` в качестве префикса, ключи из `object` в качестве имен описаний, а значения `object` как источник описания; возвращает объект с ключами из `object`, но значения - созданные `SourceWrapper`

    ```js
    var res = basis.template.theme('foo').define('my.namespace', {
      'foo': basis.resource('./path/to.tmpl'),
      'baz': 'some content'
    });

    console.log(res);
    // console> { foo: basis.template.SourceWrapper { .. }, baz: basis.template.SourceWrapper { .. } }
    ```

  * define(object) – задает список описаний, используя ключи из `object` в качестве имен описаний; возвращает тему, чей метод вызван;

    ```js
    var res = basis.template.theme('foo').define({
      'foo.bar': basis.resource('./path/to.tmpl'),
      'baz': 'some content'
    });

    console.log(res);
    // console> basis.template.Theme { .. }
    ```

  * define(fn) – используется результат вызова этой функции, предполагается что это будет объект;

    ```js
    basis.template.theme('foo').define(basis.resource('./template/mytheme/mytheme.js'));
    ```

    template/mytheme/mytheme.js:

    ```js
    module.exports = {
      'foo.bar': resource('./bar.tmpl'),
      'baz': 'some content'
    };
    ```

Для темы нельзя определить описание для имени, для которого уже задано описание.

Другие методы `basis.template.Theme`:

  * apply() – делает тему текущей (применяет тему);

  * getSource(path, withFallback) – возвращает описание темы с именем `path`; если `withFallback` равно `true`, то описание возвращается с учетом `fallback`.

Другие функции в области имен `basis.template` относящиеся к темам:

  * getThemeList() – возвращает текущий список имен тем (созданных на данный момент);

  * currentTheme() – возвращает интерфейс текущей темы;

  * setTheme(name) – устанавливает тему с именем `name` текущей;

  * getPathList() – возвращает текущий список имен описаний

  * onThemeChange(fn, context, fire) – позволяет добавить функцию `fn`, которая будет вызываться с контестом `context`, когда меняется тема; аргумент `fire` должна ли функция быть вызвана при добавлении, если `true`, то должна;

  * define(..) – определяет описания для базовой темы (`basis.template.define` === `basis.template.theme('base').define`).
