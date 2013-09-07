# Ресурсы (модульность)

Основой модульности `basis.js` являются ресурсы.

Ресурс - это некоторый файл. Ресурсы используются для того, чтобы выносить из javascript контент разного типа в отдельные файлы, а также сегментировать сам javascript код.

Для определения ресурса используется функция `basis.resource()`, которой передается путь к файлу. Если путь относительный (не начинается с `/`), то путь разрешается относительно текущего пути, то есть относительно индексного `html` файла.

Функция `basis.resource` возвращает специальную функцию, которой возвращает содержимое файла. Первый вызов приводит к загрузке файла и его кешированию, а последующие вызовы лишь возвращают закешированный результат. У такой функции также есть метод `fetch`, который делает то же, что и вызов самой функции, и используется для улучшения читаемости кода.

```js
var someText = basis.resource('path/to/file.txt'); // объявление, файл еще не загружен

console.log(someText());        // файл будет загружен, его содержимое будет закешировано и возвращено
console.log(someText.fetch());  // эквивален, будет возвращено закешированное значение
```

Ресурсы обеспечивают возможность раннего связывания и поздней инициализации. Пример:

```js
var MyControl = basis.ui.Node.subclass({
  template: basis.resource('path/to/template.tmpl')
});
```

Здесь создается класс `MyControl` и определяется файл шаблона. Такое определение не приводит к загрузке файла шаблона, так как он еще не нужен. Но когда будет создан первый экземпляр этого класса, потребуется создать экземпляр шаблона, и только тогда будет загружен файл и использовано его содержимое.

В зависимости от типа файла (его расширения), может возвращаться не только текстовое значение файла, но и значения других типов. То что будет возвращаться определяет post-обработчик, ассоциированный с определенным расширением. В `basis` определены обработчики для расширений `.js` и `.json`, (а также `.css`, если подключен модуль `basis.ccsom`). Можно определить собственные обработчики.

## Javacript

Содержимое `.js` файлов оборачивается в специальную функцию и немедленно вызывается с определенными параметрами. Таким образом, для кода всегда создается локальная область видимости, в которой доступен ряд значений и функций.

В область видимости кода добавляются следующие значения:

* `exports` – объект экспорта
* `module` – объект представляющий модуль
* `basis` – ссылка на корневой неймспейс basis.js
* `global` – ссылка на глобальную область видимости (в браузере это `window`)
* `__filename` – полный путь и имя файла
* `__dirname` – полный путь до директории, содержащую файл
* `resource` – функция, которая делает то же что и `basis.resource`, но разрешает имена файлов текущего файла, а не индексного html файла

Пример модуля, допустим, его путь `/src/module/list/index.js`:

```js
basis.require('basis.ui');

var list = basis.ui.Node({
  template: resource('template/list.tmpl'),  // путь к файлу /src/module/list/template/list.tmpl
  ...
});

module.exports = {      // то, что будет возвращаться при использовании ресурса
  MyClass: MyClass
};
```

Использование:

```
// объявляем ресурс, файл еще не загружен и код не выполнен
var list = basis.resource('src/module/list/index.js');
console.log(list());    // файл загружается, выполняется код, возвращается module.exports

// либо
var list = basis.resource('src/module/list/index.js').fetch();  // файл загружается,
console.log(list);      // { MyClass: ..., someFn: ... }
```

Следующий код схематично показывает что происходит с содержимым javascript файла:

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

> Код `javascript` ресурсов выполняется в `strict mode`.

## JSON

Если файл имеет расширение `.json`, то содержимое файла парсится функцией `JSON.parse` и возвращается результат.

```js
var settings = basis.resource('settings.json').fetch();
if (settings.someName) {
  // do something
}
```

Если файл содержит некорректный `json`, то будет возвращен `null`.

## Добавление собственных типов файлов

Чтобы определить собственный обработчик для некоторого расширения нужно зарегистирировать его в объекте `basis.resource.extensions`, где ключ - это расширение файла, начинающееся с точки, а значение - функция, принимающая содержимое файла и путь к нему. Возвращаемое такой функцией значение будет являться значением ресурса.

Допустим, требуется добавить поддержку `CoffeeScript`. Для этого нужно подключить компилятор `CoffeeScript` и назначить обработчик расширений `.coffee`, например так:

```html
<script src="path/to/coffeescript.js"></script>
<script>
  basis.resource.extensions['.coffee'] = function(content, url){
    return basis.resource.extensions['.js'](CoffeeScript.compile(content), url);
  }
</script>
```

Компилятор `CoffeeScript` можно подключить через механизм ресурсов:

```js
var CoffeeScript = basis.resource('path/to/coffeescript.js').fetch().CoffeeScript;

basis.resource.extensions['.coffee'] = function(content, url){
  return basis.resource.extensions['.js'](CoffeeScript.compile(content), url);
}
```

> Не все стороние библиотеки могут быть подключены как ресурс, так как они не работают в strict mode.

Данное решение будет работать для `dev` режима, но сборщиком `CoffeeScript` будет восприниматься как строка, не будет проанализирован и, как следствие, зависимости такого модуля не будут найдены. Для решения проблемы, сборщику нужно скомпилировать `CoffeeScript` в `javascript`, для этого в его настройках определяется препроцессор для файлов с расширением `.coffee`:

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
var CoffeeScript = require('path/to/coffeescript.js');

exports.process = function(content, file, baseURI, console){
  console.log('Compile ' + file.relpath + ' to javascript');
  file.filename = file.filename.replace(/.coffee$/i, '.js');
  return CoffeeScript.compile(content);
}
```

С таким препроцессором в сборке `CoffeeScript` код будет скомпилирован в `javascript`, а расширение файлов изменено с `.coffee` на `.js`.
