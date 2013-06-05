# Ресурсы (модульность)

Механизм ресурсов является основой модульности `basis.js`.

Ресурс - это некоторый файл. Ресурсы используются для того, чтобы выносить из javascript контент разного типа в отдельные файлы, а также сегментировать сам javascript.

Для определения ресурса используется функция `basis.resource()`, которой передается путь к файлу. Если путь относительный (не начинается с `/`), то путь разрешается относительно текущего `location` (то есть относительно индексного `html` файла).

Функция `basis.resource` возвращает специальную функцию, а не само содержимое файла. А вот вызов такой функции возвращает содержимое файла; первый вызов приводит к загрузке файла, а последующие возвращают закешированный результат. У такой функции также есть метод `fetch`, который делает то же, что и вызов самой функции, и используется для улучшения читаемости кода.

```js
var someText = basis.resource('path/to/file.txt'); // объявление, файл еще не загружен

console.log(someText());        // файл будет загружен, его содержимое будет закешировано и возвращено
console.log(someText.fetch());  // эквивален, будет возвращено закешированное значение
```

При такой реализации ресурсы обеспечивают возможность раннего связывания и поздней инициализации. Рассмотрим пример:

```js
var MyControl = basis.ui.Node.subclass({
  template: basis.resource('path/to/template.tmpl')
});
```

Здесь создается класс `MyControl` и определяется файл шаблона. Такое определение не приводит к загрузке файла шаблона, так как он еще не нужен. Но когда будет создан первый экземпляр этого класса, потребуется создать экземпляр шаблона, и только тогда будет загружен файл и использовано его содержимое.

Файлы могут быть любого типа. В зависимости от типа файла, может возвращаться не только строка. Тип файла определяется по расширению, а что будет возвращаться - определяет post-обработчик, ассоциированный с определенным типом. В `basis` есть специальные обработчики для `json` и `javascript`,
 (а также `css`, если подключен модуль `basis.ccsom`). Также можно определить собственные.

## JSON

Если файл имеет расширение `.json`, то функция ресурса будет возвращать объект. Другими словами, содержимое файла автоматически парсится в объект.

```js
var settings = basis.resource('settings.json').fetch();
if (settings.someName) {
  // do something
}
```

Если файл содержит некорректный `json`, то будет возвращен `null`.

Для примера, модуль `basis.l10n` (локализация) использует эту трансформацию и хранит словари в `json`.

## Javacript

Содержимое `javascript` файлов (файлы с расширением `.js`) оборачивается в специальную функцию и тут же вызывается с определенными параметрами. Таким образом создается локальная область видимости, в которой доступны определенные значения и функции.

В область видимости кода добавляются следующие значения:

* `exports` – объект экспорта
* `module` – объект представляющий модуль
* `basis` – ссылка на фреймворк (таким образом ссылки на фреймворк может не быть в глобальной области имен)
* `global` – ссылка на глобальную область видимости (в браузере это `window`)
* `__filename` – имя файла
* `__dirname` – путь до файла
* `resource` – функция, которая делает то же что и `basis.resource`, но разрешает имена файлов относительно модуля, а не индексного файла

Пример модуля, допустим, его путь `src/module/list/index.js`:

```js
basis.require('basis.ui');

var list = basis.ui.Node({
  template: resource('template/list.tmpl'),  // путь к файлу src/module/list/template/list.tmpl
  ...
});

module.exports = {   // то, что мы хотим экспортировать
  MyClass: MyClass,
  someFn: function(a, b){
    // do something
  }
};
```

А теперь его использование:

```
var list = basis.resource('src/module/list/index.js');
console.log(list());

// либо
var list = basis.resource('src/module/list/index.js').fetch();
console.log(list);  // { MyClass: ..., someFn: ... }
```

Для лучшего понимания приводим код, который показывает, что происходит с javascript ресурсом после того, как получено содержимое файла:

```js
var module = {
  exports: {}
};
var relResource = function(url){
  return basis.resource('src/module/list/' + url);
};

(function(exports, module, basis, global, __filename, __dirname, resource){
  'use strict';

  // содержимое файла

}).call(module.exports, module.exports, module, basis, this,
  'src/module/list/index.js', 'src/module/list/', relResource);

return module.exports;
```

Подобным образом работает функция `require` в `node.js`.

> Стоит так же заметить, что код `javascript` ресурсов выполняется в `strict mode`.

## Добавление собственных типов файлов

Для того чтобы добавить новый тип файлов, для которых должно возвращаться что-то отличное от содержимого файла, необходимо добавить обработчик для определенного расширения. Обработчики определяются в объекте `basis.resource.extensions`, где ключ - это расширение файла, начинающееся с точки, а значение - функция, которая принимает содержимое файла и путь к нему, а возвращаемое значение будет являться значением ресурса.
Допустим требуется добавить поддержку `CoffeeScript`. Для этого нужно подключить компилятор `CoffeeScript` и назначить обработчик расширений `.coffee`, например так:

```html
<script src="path/tp/coffeescript.js"></script>
<script>
  basis.resource.extensions['.coffee'] = function(content, url){
    return basis.resource.extensions['.js'](CoffeeScript.compile(content), url);
  }
</script>
```

Либо же сделать специальный ресурс, например, `coffeeScriptSupport.js`:

```js
var CoffeeScript = basis.resource('path/tp/coffeescript.js').fetch().CoffeeScript;

basis.resource.extensions['.coffee'] = function(content, url){
  return basis.resource.extensions['.js'](CoffeeScript.compile(content), url);
}
```

Преимущество ресурса в том, что его подключение можно оформить таким образом, чтобы он вырезался из сборки (используя `;;;` либо `/** @cut */`).

Нужно также помнить, что данное решение будет работать для `dev` режима, но в сборке код на `CoffeeScript` будет включаться как строка, и код не будет проанализирован – таким образом, зависимости такого модуля не будут найдены. Для того чтобы код в сборке был скомпилирован в javascript и был проанализирован, нужно определить это в настройках сборщика, определив препроцессор для файлов с расширением `.coffee`:

```json
{
  "build": {
    ...
    "extFileTypes": {
      ".coffee": {
        "type": "script",
        "preprocess": "compile-coffee-script.js"
      }
    }
  }
}
```

Содержимое `compile-coffee-script.js` может иметь такой вид:

```js
var CoffeeScript = require('path/to/coffeescript');

exports.process = function(content, file, baseURI, console){
  console.log('Compile ' + file.relpath + ' to javascript');
  file.filename = file.filename.replace(/.coffee$/i, '.js');
  return CoffeeScript.compile(content);
}
```

С таким препроцессором код будет скомпилирован в `javascript`, а ссылки на него в сборке будут как на обычные `.js` файлы.

