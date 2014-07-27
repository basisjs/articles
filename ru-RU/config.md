# Конфигурация

Приложение и поведение `basis.js` конфигурируется при подключении `basis.js`. Конфигурация задается в атрибуте `basis-config` или `data-basis-config`.

```html
<script src="path/to/basisjs/src/basis.js" basis-config="
  noConflict: true,
  modules: {
    app: {
      autoload: true,
      filename: 'src/app.js'
    }
  }
"></script>
```

Конфигурация – это обычный `JavaScript` объект, у которого опущены обрамляющие фигурные скобки. Поэтому поддерживаются любые конструкции доступные в `JavaScript`.

Все опции являются необязательными и конфигурация может быть пустой строкой. В этом случае будут использоваться значения по умолчанию.

В момент инициализации ядра `basis.js`, конфигурация анализируется, и для известных опций нормализуются значения. Неизвестные опции остаются в исходном виде. Нормализованая конфигурация сохраняется в `basis.config` и может быть использована модулями и приложением.

С версии `1.3` появилась функция `basis.processConfig`, которая доступна только в режиме разработки. Она позволяет получить нормализованную конфигурацию из любого объекта. В частности, эта функция используется сборщиком `basisjs-tools` (с версии `1.3.12`) для преобразования конфигурации при сборке (в сборку попадает нормализованная конфигурация).

## Опции

### noConflict

* Тип: `Boolean`
* По умолчанию: `false`
* Доступно с версии `1.0`

По умолчанию, корневые пространства имен при создании добавляются в глобальную область видимости. Это удобно при разработке. Но такое поведение не всегда является необходимым поведением, так как может приводить к конфликтам имен, либо же из-за соображения безопасности. В случае, если требуется запретить добавление в глобальную область видимости, необходимо задать этой опции значение `true`.

Если `noConflict: true`, то корневые пространства имен становятся не доступны в глобальной области видимости. Поэтому единственный вариант инициализации приложения (первичного модуля) использовать опцию `autoload`, либо настройку `autoload` в описании модулей в опции `modules`. Любой модуль подключаемый `basis.js` через `basis.resource` или `basis.require` (или их локальные версии в рамках модулей) имеет ссылку в своей области видимости на сам `basis.js` – `basis`. Имея такую ссылку можно получить доступ к любому пространству имен (через `basis.namespace`) или модулю (через `[basis.]require` или `[basis.]resource`).

### autoload

* Тип: `String`
* По умолчанию: `undefined`

Опция позволяет указать какой модуль нужно загрузить автоматически, сразу после загрузки ядра. Позволяет сократить описание частой ситуации.

```html
<!-- без autoload -->
<script src="path/to/basisjs/src/basis.js" basis-config=""></script>
<script>
  basis.require('app');
</script>

<!-- эквивалент, используя autoload -->
<script src="path/to/basisjs/src/basis.js" basis-config="autoload: 'app'"></script>
```

В значении задается корневое пространство имен, который нужно загрузить. Если в значении присутсвуют слеши (`/`), то все что идет до последнего слеша используется в качестве базового пути для корневого пространства имен.

```html2
<script src="path/to/basisjs/src/basis.js" basis-config="autoload: 'path/to/app'"></script>

<!-- эквивалентно -->
<script src="path/to/basisjs/src/basis.js" basis-config="autoload: 'app', path: { app: 'path/to/app' }"></script>
```

До версии `1.3` можно было указать только один модуль, который должен быть загружен автоматически. Начиная с версии `1.3` автозагружаемых модулей может быть произвольное количество. Необходимость в автоматической загрузки можно задать для любого модуля, задав `autoload: true` в описании модуля в секции `modules`.

### path

* Тип: `Object`
* Устаревшая опция с версии `1.3`

Позволяет задать пути для корневых пространств имен (библиотек). Значением опции является объект, где ключи – названия корневых пространств имен, а значение – базовый путь. Пути разрашаются относительно `html` страницы. Например:

```html
<script src="path/to/basisjs/src/basis.js" basis-config="
  path: {
    foo: 'path/to/foo.js'
  }
"></script>
<script>
  console.log(basis.resolveNSFilename('foo'));
  // > '/page/location/path/to/foo.js'

  console.log(basis.resolveNSFilename('foo.bar'));
  // > '/page/location/path/to/foo/bar.js'
</script>
```

Существует несколько правил для нормализации путей:

```js
// если путь заканчивается на `/`, то в конце подставляется имя модуля
// path: {
//   foo: 'path/to/'
// }
console.log(basis.resolveNSFilename('foo'));
// > '/page/location/path/to/foo.js'
console.log(basis.resolveNSFilename('foo.bar'));
// > '/page/location/path/to/foo/bar.js'

// если в конце нет расширение `.js` оно подставляется
// path: {
//   foo: 'path/to/foo'
// }
console.log(basis.resolveNSFilename('foo'));
// > '/page/location/path/to/foo.js'
console.log(basis.resolveNSFilename('foo.bar'));
// > '/page/location/path/to/foo/bar.js'

// имя в конце может не совпадать с именем модуля
// path: {
//   foo: 'path/to/baz'
// }
console.log(basis.resolveNSFilename('foo'));
// > '/page/location/path/to/baz.js'
console.log(basis.resolveNSFilename('foo.bar'));
// > '/page/location/path/to/baz/bar.js'
```

Начиная с версии `1.3` опция считается устаревшей и будет удалена в будущих версиях. Вместо нее стоит использовать `modules`, с помощью которой можно задать более развернутое описание библиотек (модулей). С версии `1.3`, если используется `path`, то значение подмешивается к `modules` без перезаписи ключей определенных в `modules`.

### modules

* Тип: `Object`
* Доступно с версии `1.3`

Используется для описание библиотек (корневых модулей), их расположения и поведения. Значение опции является объект, где ключи – названия корневых пространств имен, а значение – объект описание.

В описании модуля можно указать следующие опции:

* `autoload` – автоматически загружать модуль после инициализации ядра;
* `filename` – путь к корневому файлу библиотеки (модуля);
* `path` – базовый путь для вложенных модулей библиотеки (модуля).

Все опции не являются обязательными. В качестве описания может быть задана строка. В этом случае, строка считается значением опции `filename`.

```html
<script src="path/to/basisjs/src/basis.js" basis-config="
  modules: {
    foo: 'path/to/foo.js'
  }
"></script>

<!-- эквивалентно -->
<script src="path/to/basisjs/src/basis.js" basis-config="
  modules: {
    foo: {
      filename: 'path/to/foo.js'
    }
  }
"></script>
```

От того заданы одновременно обе опции `filename` и `path`, или только одна из них зависит сценарий разрешения путей. Но в результаты будут получены значения для обеих опций.

* если заданы оба значения, то `path` разрешается относительно пути страницы, а `filename` относительно полученного `path`; при этом для `path` используется `basis.path.dirname(filename)`;
* если задано только `filename`, то повторяется поведение устаревшей опции `path` (по этой причине, для перехода на использование `modules` вместо `path`, достаточно изменить имя опции);
* если задано только `path`, то сначала повторяется логика для `filename`, а для базового имени используется `basis.path.dirname(filename)`.

```js
// modules: {
//   foo: {
//     path: 'path/to/',
//     filename: 'index.js'
//   }
// }
console.log(basis.config.modules.foo);
// > {
//      path: '/page/location/path/to',
//      filename: '/page/location/path/to/index.js'
//   }
console.log(basis.resolveNSFilename('foo'));
// > '/page/location/path/to/index.js'
console.log(basis.resolveNSFilename('foo.bar'));
// > '/page/location/path/to/bar.js'

// modules: {
//   foo: {
//     filename: 'path/to/index.js'
//   }
// }
console.log(basis.config.modules.foo);
// > {
//      path: '/page/location/path/to/index',
//      filename: '/page/location/path/to/index.js'
//   }
console.log(basis.resolveNSFilename('foo'));
// > '/page/location/path/to/index.js'
console.log(basis.resolveNSFilename('foo.bar'));
// > '/page/location/path/to/index/bar.js'

// modules: {
//   foo: {
//     path: 'path/to/index.js'
//   }
// }
console.log(basis.config.modules.foo);
// > {
//      path: '/page/location/path/to',
//      filename: '/page/location/path/to/index.js'
//   }
console.log(basis.resolveNSFilename('foo'));
// > '/page/location/path/to/index.js'
console.log(basis.resolveNSFilename('foo.bar'));
// > '/page/location/path/to/bar.js'

// слеш (`/`) в конце значения для `path` игнорируется
// modules: {
//   foo: {
//     path: 'path/to/'
//   }
// }
console.log(basis.config.modules.foo);
// > {
//      path: '/page/location/path/to',
//      filename: '/page/location/path/to.js'
//   }
console.log(basis.resolveNSFilename('foo'));
// > '/page/location/path/to.js'
console.log(basis.resolveNSFilename('foo.bar'));
// > '/page/location/path/to/bar.js'
```

### implicitExt

* Значения: `true`, `false` или `'warn'`
* По умолчанию (зависит от версии)
  * `1.4` – `true`
  * `1.5` – `'warn'`
  * `1.6` – `false`
* Доступно с версии `1.4`
* Будет удалено в версии `1.7` с сохранением поведения для значения `false`

Исторически `basis.js` неявно расширяет пространства имен, дополняя их свойствами ссылающиеся на вложенные пространства имен и свойствами из `exports` модуля. Таким образом появляется возможность использовать вложенные пространства имен и значения из `exports` без явного объявления. С одной стороны это удобно, но с другой стороны приводит к путанице и конфликтам (например, если название вложенного пространства имен совпадает со значением из `exports`). К тому же, это учложняет статический анализ при сборке, так как теряются явные связи между модулями. Подробнее о проблеме можно прочитать [в документе про отказ от пространств имен](https://docs.google.com/document/d/1no1mEp3BsWa8DaXz675oKnLgapSUKcXBwYEo9LOj_DA/edit#) в их изначальном виде.

Данная опция позволяет управлять неявным расширением. Поведение зависит от значения опции:

* `true` – осуществлять неявное расширение (исторически сложившееся поведение);
* `'warn'` – осуществлять неявное расширение, но выводить предупреждение при обращении к неявно заданным свойствам (полезно при миграции);
* `false` – не делать неявного расширения (планируемое поведение с версии `1.6`).

При `implicitExt: true` следующий пример является валидным:

```js
// basis.config.implicitExt = true
basis.require('basis.ui');
var view = new basis.ui.Node();
```

Если значение `implicitExt` равно `'warn'`, то в консоли будет выведено два предупреждения.

```js
// basis.config.implicitExt = 'warn'
basis.require('basis.ui');
var view = new basis.ui.Node();
// > basis.js: Access to implicit namespace `basis.ui`
// > basis.js: Access to implicit namespace property `basis.ui.Node`
```

В случае если значение `implicitExt` равно `false`, будет выброшено исключение, так как `basis.ui` не будет объявлено (как и `Node` в пространстве имен `basis.ui`).

```js
// basis.config.implicitExt = false
basis.require('basis.ui');

console.log('ui' in basis);
// > false

console.log('Node' in basis.namespace('basis.ui'))
// > false
```

Опция необходима на переходный период и будет удалена в версии `1.7`, с сохранением поведения для значения `false`.

### extProto

* Значения: `true`, `false` или `'warn'`
* По умолчанию (зависит от версии)
  * до версии `1.2` – `'warn'`
  * с версии `1.2` – `false`
* Доступно с версии `1.0`
* Удалено в версии `1.3`

Сообщает `basis.js` нужно ли дополнять прототипы встроенных классов дополнительными методами. Поведение зависит от значения:

* `true` – расширять прототипы;
* `'warn'` – расширять прототипы, но выводить предупреждение при использовании таких методов;
* `false` – не нужно расширять прототипы.

Опция была нужна на переходный период отказа от расширений прототипов стандартных классов. Начиная с версии `1.3` прототипы не расширяются, и нет возможности управлять этим.

### extClass

* Тип: `Boolean`
* Удалено в версии `1.0`

Сообщает `basis.js` нужно ли дополнять встроенные классы статическими методами. Поведение зависит от значения:

* `false` – не менять классы;
* `true` – дополнять классы статическими методами.

Опция была нужна на переходный период отказа от функций прикрепленных к стандартным классам. Начиная с версии `1.0` классы не расширяются, и нет возможности управлять этим.
