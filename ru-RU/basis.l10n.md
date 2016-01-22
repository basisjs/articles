# basis.l10n

Модуль `basis.l10n` обеспечивает [локализацию](http://ru.wikipedia.org/wiki/%D0%AF%D0%B7%D1%8B%D0%BA%D0%BE%D0%B2%D0%B0%D1%8F_%D0%BB%D0%BE%D0%BA%D0%B0%D0%BB%D0%B8%D0%B7%D0%B0%D1%86%D0%B8%D1%8F), то есть возможность использовать те или иные значения в зависимости от выбраной культуры (языка).

Этот модуль оперирует в рамках трех типов сущностей:

* [Словарь](#Словарь) – набор значений;
* [Культура](#Культура) – язык и его настройки;
* [Токен](#Токен) (значение) – непосредственное значение, которое используется.

Локализация предоставляемая `basis.l10n` является полностью динамической, т.е. позволяет изменять выбранную культуру и содержимое словарей без перезагрузки страницы. В разработке могут использоваться [инструменты](#Инструменты), которые упрощают работу с локализацией.

## Словарь

Словарь – это интерфейс к набору значений, сгруппированых по культуре.

Содержимое словарей хранится в отдельных файлах с расширением `.l10n` в формате JSON. Ключи первого уровня являются кодами культуры, а значение – набор значений для словаря.

```json
{
  "en-US": {
    "hello": "Hello world!"
  },
  "ru-RU": {
    "hello": "Привет мир!"
  }
}
```

Словари являются экземплярами класса `basis.l10n.Dictionary` и объявляются с помощью функции-хелпера `basis.l10n.dictionary`. Этой функции передается имя файла. Если для заданного имени уже существует словарь, то он возвращается, иначе создается новый.

```js
var myDict = basis.l10n.dictionary('path/to/dict.l10n');
```

Если расширение файла не соответствует `.l10n`, то оно заменяется на `.l10n`. Таким образом, можно использовать `__filename` (имя файла модуля), если имя файла словаря отличается от имени файла модуля только расширением.

```js
var myDict = basis.l10n.dictionary(__filename);
```

Задаваемый путь к файлу разрешается относительно корня приложения. Если требуется указать путь относительно модуля, можно использовать локальную переменную `__dirname`.

```js
var myDict = basis.l10n.dictionary(__dirname + 'relative/path/to/dict.l10n');
```

Словарь предоставляет доступ к своим ключам посредством метода `token`, которому передается имя токена. Если токена с заданым именем нет, то он создается. Значением токена является значение из файла словаря для текущей культуры, с учетом альтернатив.

```js
var myDict = basis.l10n.dictionary(__filename);
console.log(myDict.token('hello').value);
// console> 'Hello world!'

basis.l10n.setCulture('ru-RU');
console.log(myDict.token('hello').value);
// console> 'Привет мир!'

console.log(myDict.token('nonexistent').value);
// console> undefined
```

В описании словаря поддерживается вложенность.

```json
{
  "en-US": {
    "hello": "Hello world!",
    "example": {
      "foo": "Foo",
      "bar": "Bar"
    }
  }
}
```

В таком случае именем токена является конкатенация ключей разделеных точкой (`.`).

```js
var myDict = basis.l10n.dictionary('./path/to/dict.l10n');
console.log(myDict.token('example').value);
// console> { foo: "Foo", bar: "Bar" }
console.log(myDict.token('example.foo').value);
// console> 'Foo'
```

Описание словаря может содержать дополнительную информацию о словаре, для этого используется специальная секция `_meta`. Эта секция, в частности, используется для задания специальных типов для определенных ключей.

```json
{
  "_meta": {
    "type": {
      "example": "plural"
    }
  },
  "en-US": {
    "hello": "Hello world!",
    "example": ["example", "examples"]
  }
}
```

## Культура

Культура – это некоторые языковые правила.

У каждой культуры есть свой [код](http://en.wikipedia.org/wiki/Language_localisation#Language_tags_and_codes) (обозначение). Он может быть любым, но рекомендуется придерживаться системы обозначения на основе стандарта [ISO 639-1](http://en.wikipedia.org/wiki/ISO_639-1). Так код должен состоять из основной части, двухбуквенного кода языковой семьи в нижнем регистре, и опциональной второй части, двухбуквенный код географической принадлежности в верхнем регистре. Например, `en-GB` – британский английский, `en-US` – американский английский, `en-CA` – канадский английский и т.д.

Используемые приложением культуры объявляются функцией `basis.l10n.setCultureList`. А функция `basis.l10n.getCultureList` возвращает текущий список используемых культур. Список не может быть пустым.

```js
basis.l10n.setCultureList('ru-RU en-US');
// альтернативный вариант
basis.l10n.setCultureList(['ru-RU', 'en-US']);

console.log(basis.l10n.getCultureList());
// console> ['ru-RU', 'en-US']
```

За каждой культурой в словарях закрепляются определенные значения. Если определенного значения нет для заданной культуры, то значение может быть взято из значений для другой культуры. По умолчанию, такой культурой является первая в списке, заданном `basis.l10n.setCultureList` (считается, что первая культура наиболее полная). Для любой культуры можно задать альтернативу – при объявлении списка культур. Для этого после обозначения культуры нужно поставить `/` (слеш) и далее указать обозначение альтернативной культуры. Можно задать только одну альтернативу, но при этом используется альтернативная культура альтернативной культуры и далее по цепочке.

```js
basis.l10n.setCultureList('en-US ru-RU uk-UK/ru-RU xx-XX/uk-UK');
// для ru-RU поиск будет ru-RU -> en-US
// для uk-UK: uk-UK -> ru-RU -> en-US
// для xx-XX: xx-XX -> uk-UK -> ru-RU -> en-US
```

Текущая культура определяет, какой набор значений словаря должен использоваться. Ее код возвращает функция `basis.l10n.getCulture`. Текущая культура может быть изменена в любой момент с помощью функции `basis.l10n.setCulture`, которой передается код культуры. Код культуры, задаваемой в качестве текущей, должен быть в списке культур, определенном функцией `basis.l10n.setCultureList`. При смене текущей культуры, словари обновляют свои значения согласной выбранной культуре и правилам альтернатив (это происходит без перезагрузки страницы).

```js
basis.l10n.setCulture('ru-RU');

console.log(basis.l10n.getCulture());
// console> 'ru-RU'
```

С помощью функции `basis.l10n.onCultureChange(fn, context, fire)` можно задать функцию-обработчик на изменение текущей культуры. Эта функция принимает до трех аргументов:

* fn - функция, которая должна быть вызвана при изменении текущей культуры;
* context - значение, которое будет выступать в качестве `this` вызываемой функции;
* fire - добавляемая функция-обработчик, должна быть вызвана сразу после добавления.


```js
basis.l10n.onCultureChange(function(culture){
  console.log('Current culture is ', culture);
});

console.log(basis.l10n.getCulture());
// console> en-US

basis.l10n.setCulture('ru-RU');
// console> Current culture is ru-RU
```

Культуры являются экземплярами класса `basis.l10n.Culture`, который содержат языковые настройки культуры. Экземпляр культуры можно получить с помощью функции-хелпера `basis.l10n.culture`. Эта функция возвращает культуру, ассоциированную с заданным кодом, а если таковой нет, то создает ее.

```js
var culture = basis.l10n.culture('ru-RU');
console.log(culture);
// console> basis.l10n.Culture { name: "ru-RU", ... }

// эквивалент
var culture = new basis.l10n.Culture('ru-RU');
console.log(culture);
// console> basis.l10n.Culture { name: "ru-RU", ... }

//
console.log(basis.l10n.culture('ru-RU') === basis.l10n.culture('ru-RU'));
// console> true
```

Функция `basis.l10n.culture` расширена методами и свойствами [`basis.Token`](basis.Token.md). Поэтому в большинстве случаев может использоваться как экземпляр `basis.Token`, хотя таковым не является. Например, в качестве значения для биндига (так как имеет интерфейс [`binding bridge`](bindingbridge.md)).

```js
basis.require('basis.l10n');
basis.require('basis.ui');

var view = new basis.ui.Node({
  template: '<span>Current culture is {currentCulture}</span>',
  binding: {
    currentCulture: basis.l10n.culture
  }
});
```

Или как альтельнатива другим функциям.

```js
// эквивалент getCulture
console.log(basis.l10n.culture.get());
// console> en-US
console.log(basis.l10n.culture.value);
// console> en-US

// эквивалент setCulture (с версии 1.0.1)
basis.l10n.culture.set('ru-RU');

// эквивалент onCultureChange
basis.l10n.culture.attach(function(culture){
  console.log('Current culture is ', culture);
});
```

Для удаления обработчика на смену культуры нет специальной функции. Но это можно сделать импользуя метод `basis.l10n.culture.detach`.

```js
var myCultureChangeHandler = function(culture){
  console.log('Current culture is ', culture);
};

// добавляем обработчик
basis.l10n.onCultureChange(myCultureChangeHandler);

basis.l10n.getCulture();
// console> en-US

basis.l10n.setCulture('ru-RU');
// console> Current culture is ru-RU
// console> undefined

basis.l10n.culture.detach(myCultureChangeHandler);

basis.l10n.setCulture('ru-RU');
// не будет сообщений в консоли
```

## Токен

Токены являются экземплярами класса `basis.l10n.Token`, который унаследован от `[basis.Token](basis.Token.md)`. Эти объекты хранят значение, которое соответствует текущей культуре.

Получить токен можно следующими способами:

* вызвав метод словаря `token(path)`;
* используя функцию `basis.l10n.token(absolutePath)`; функции передается строка: ключ и путь к файлу словаря, разделенные символом `@`;
* используя метод токена `token(name)`; таким образом можно получить вложенные токены.

```json
{
  "en-US": {
    "example": {
      "foo": "Foo",
      "bar": "Bar"
    }
  }
}
```

```js
var myDict = basis.l10n.dictionary('./path/to/dict.l10n');

console.log(myDict.token('example.foo'));
// console> basis.l10n.Token { name: 'example.foo', value: 'Foo' }

console.log(basis.l10n.token('example.foo@path/to/dict.l10n'));
// console> basis.l10n.Token { name: 'example.foo', value: 'Foo' }

console.log(myDict.token('example').token('foo'));
// console> basis.l10n.Token { name: 'example.foo', value: 'Foo' }

console.log(myDict.token('example.foo') === basis.l10n.token('example.foo@path/to/dict.l10n'));
// console> true
```

### Типы токенов

Токен может быть одного трех типов:

* `default` - обычная строка, назначается по умолчанию;
* `plural` - [грамматическое число](http://ru.wikipedia.org/wiki/%D0%93%D1%80%D0%B0%D0%BC%D0%BC%D0%B0%D1%82%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%BE%D0%B5_%D1%87%D0%B8%D1%81%D0%BB%D0%BE) (единственное и множественное числа), значение склоняемое в зависимости от числа;
* `markup` - строка, содержащая `HTML` разметку.

Тип задается в секции `_meta` описания словаря, в секции `type`. Тип накладывается на полный путь токена и является одинаковым для всех культур словаря. Если для пути токена не определен тип или значение типа является неверным, используется тип `default`.

```json
{
  "_meta": {
    "type": {
      "bar": "plural",
      "baz": "markup"
    }
  },
  "en-US": {
    "foo": "Default",
    "bar": ["bar", "bars"],
    "baz": "<h1>Markup token</h1>"
  }
}
```

```js
var myDict = basis.l10n.dictionary('path/to/dict.l10n');

console.log(myDict.token('foo').type);
// console> 'default'

console.log(myDict.token('bar').type);
// console> 'plural'

console.log(myDict.token('baz').type);
// console> 'markup'
```

#### Plural

Для указания, что токен является `plural`, нужно явно указать тип токена в секции `_meta` словаря. Значение для таких токенов задается в виде массива, где каждый элемент является формой фразы в зависимости от некоторого числа. Количество форм и функция выбора формы зависит от культуры, например, в русском языке 3 формы, а в английском – 2.

```json
{
  "_meta": {
    "type": {
      "example": "plural"
    }
  },
  "en-US": {
    "example": ["example", "examples"]
  },
  "ru-RU": {
    "example": ["пример", "примера", "примеров"]
  }
}
```

В `basis.l10n` уже определены функции выбора формы для большинства культур (языков). При определении формы заданное значение приводится к числу, от числа отбрасывается дробная часть, знак и лишь тогда вычисляется подходящая форма. Доступные функции выбора формы можно получить в виде массива, обратившись к свойству `basis.l10n.pluralForms`. Всего определена 21 форма.

Чтобы получить значение для некоторого числа, необходимо использовать методы `basis.l10n.Token#token()` или `basis.l10n.Token#computeToken()`.

Метод `basis.l10n.Token#token()` может подойти в простых случаях, когда нужно получить значение без сохранения динамических свойств.

```js
var l10n = basis.require('basis.l10n');
var myDict = l10n.dictionary(__filename);
var staticPluralToken = myDict.token('example').token(5);

console.log(staticPluralToken.get());
// examples

l10n.setCulture('ru-RU');
console.log(staticPluralToken.get());
// примера
```

Как видно из примера, метод `basis.l10n.Token#token()` получает необходимую форму (в примере от значения `5`) и возвращает ее текущее значение. Но само значение, для которого была вычислена форма, не сохраняется. Поэтому такой токен всегда будет возвращать значение для одной и той же формы. В примере, при переключении культуры, по-прежнему была взята вторая форма (или первая, если считать с нуля), а не правильная форма для числа `5`.

Для сохранения динамических свойств необходимо сохранять значение, для которого вычисляется форма. В этом случае, используются токены произведенные методом `basis.l10n.Token#computeToken()`. Полученный этим методом токен, хранит значение и его можно изменить используя метод `set(value)`. Токен перевычисляет форму при изменении значения, словаря или культуры.

```js
var myDict = basis.require('basis.l10n').dictionary(__filename);
var dynamicPluralToken = myDict.token('example').computeToken(1);
console.log(dynamicPluralToken.get());
// example

dynamicPluralToken.set(5);
console.log(dynamicPluralToken.get());
// examples

l10n.setCulture('ru-RU');
console.log(dynamicPluralToken.get());
// примеров

dynamicPluralToken.set(2);
console.log(dynamicPluralToken.get());
// примера
```

#### Markup

Значения этого типа могут содержать разметку (в остальных типах разметка экранируется). Но ключевое - такие значения являются описанием шаблона и поддерживают полный синтаксис шаблонов. В том числе, в их описании можно использовать биндинги, подключать другие шаблоны, стили, а также использовать другие `l10n` из того же словаря или других словарей.

```json
{
  "_meta": {
    "type": {
      "description": "markup",
      "content": "markup"
    }
  },
  "en-US": {
    "header": "Header",
    "description": "<p>Some value: {value}</p><b:include src=\"en.tmpl\"/>",
    "content": "<h1>{l10n:header}</h1><div class=\"content\">{l10:description}</div>"
  }
}
```

В данном примере два `markup` токена. Первый (`description`) использует биндинг `{value}`, а также подключает содержимое из файла `en.tmpl` (путь к файлу разрешается относительно файла словаря). Второй (`content`) используется два `l10n` биндинга, и в этом случае значения будут браться из самого словаря (так как содержимое "шаблона" описано в словаре).

При вставке в шаблон, содержимое `markup` токена оборачивается в `<span class="basisjs-markup"></span>`.

На данный момент, сборщик `basisjs-tools` не поддерживает `markup` токены (текущий подход в построении декларации не дает возможности полноценно поддерживать такой тип токенов в сборке). Поэтому по умолчанию `markup` токены "выключены", а для включения необходимо присвоить `true` флагу `enableMarkup`.

```js
basis.l10n.enableMarkup = true;

// Важно, так работать не будет:
basis.require('basis.l10n').enableMarkup = true;
```

## Использование в шаблонах

Так как класс `basis.l10n.Token` наследуется от `basis.Token`, то токены имеют интерфейс [`binding bridge`](bindingbridge.md)) и могут использоваться в биндигах, как сами по себе, так и в качестве результата `getter`.

```js
basis.require('basis.l10n');
basis.require('basis.ui');

var myDict = basis.l10n.dictionary(__filename);

var view = new basis.ui.Node({
  ...
  binding: {
    foo: myDict.token('foo'),
    enum: function(node){  // статичный биндинг
      return node.data.value == 0
        ? myDict.token('bar.zero')
        : myDict.token('bar.non-zero');
    },
    stateCaption: {
      events: 'stateChanged',
      getter: function(node){
        return myDict.token('state').token(node.state);
      }
    },
    plural: {
      events: 'update',
      getter: function(node){
        return myDict.token('baz').token(node.data.value);
      }
    }
  }
});
```

Токены также имеют метод `compute(events, getter)`, который упрощает описание `plural` и `enum` биндингов. Метод принимает параметры:

* events - список событий (строка, имена разделеные пробелом, или массив строк) владельца биндинга, при которых нужно пересчитывать значение; параметр является опциональным, и может быть опущен (в этом случае биндинг будет считаться только раз, при создании шаблона);
* getter - функция, получающая в качестве аргумента владельца биндинга; результат, возвращаемый функцией, используется как имя для получения вложенного токена.

Используя этот метод, предыдущий пример можно переписать так:

```js
basis.require('basis.l10n');
basis.require('basis.ui');

var myDict = basis.l10n.dictionary(__filename);

var view = new basis.ui.Node({
  ...
  binding: {
    foo: myDict.token('foo'),
    enum: myDict.token('bar').compute(function(node){
      return node.data.value == 0 ? 'zero' : 'non-zero';
    }),
    stateCaption: myDict.token('state').compute('stateChanged', 'state'),
    plural: myDict.token('baz').compute('update', 'data.value')
  }
});
```

Токены можно использовать в шаблоне напрямую, без получения через биндинги. Для этого используются маркеры с префикcом `l10n:`. Маркеры с префиксом `l10n:` можно использовать для текстовых узлов и в атрибутах.

```html
<div title="{l10n:attr.example}: {value}">
  {l10n:example}
</div>
```

Для маркеров с префиксом `l10n:` допускается использование биндинга в качестве последней части пути. Это применяется для перечислений (`enum` токены) и грамматического числа (`plural` токены). Таким образом при изменении значения биндинга значение в шаблоне будет перевычисляться (выбираться тот или иной токен).

```
<div class="example">
  Enum: {l10n:state.{state}}<br/>
  Plural: {l10n:plural.{number}}
</div>
```

Файл словаря указывается с помощью тега `<b:l10n>`, в котором в атрибуте `src` указывается путь к файлу (относительно шаблона). Если имя файла словаря отличается от имени файла шаблона только разрешением (например, путь к файлу шаблона `path/to/template.tmpl`, а путь к словарю `path/to/template.l10n`), то указывать тег `<b:l10n>` необязательно (обычно не указывается).

```html
<b:l10n src="./path/to/dict.l10n"/>

<div title="{l10n:attr.example}: {value}">
  {l10n:example}
</div>
```

Шаблон использует словарь, только если в описании шаблона есть хотя бы один маркер с префиксом `l10n:`. Заданный (явно или неявно) словарь применяется только для маркеров в самом описании шаблона, и на включаемые описания (подключаемые через `<b:include>`) не распространяется.

## Инструменты

Для работы с локализацией можно использовать панель разработчика `basis.devpanel` и [плагин](https://chrome.google.com/webstore/detail/basisjs-tools/paeokpmlopbdaancddhdhmfepfhcbmek) для `Google Chrome`.

![basis.devpanel](img/basis.l10n-devpanel.png)

На панели разработчика локализация представлена двумя кнопками. Одна показывает текущую культуру и позволяет сменить ее. Вторая включает режим выбора токена.

![l10n inspect mode](img/basis.l10n-inspect-mode.png)

В режиме выбора токена, подсвечиваются все текстовые узлы, которые привязаны к токену `basis.l10n`. Другими словами, весь переводимый текст. Без плагина клик по любому подсвеченному блоку ни к чему не приводит. Но если плагин установлен и активирован в `Developer tools`, то в плагине откроется словарь, к которому относится токен, а поле редактирования токена получит фокус.

![l10n inspect mode](img/basis.l10n-plugin.png)

Плагин позволяет менять содержимое словаря. Любые изменения тут же применяются без перезагрузки страницы.

При использовании `basis server`, плагин также может сохранять изменения в файл.
