# basis.l10n

Модуль `basis.l10n` обеспечивает [локализацию](http://ru.wikipedia.org/wiki/%D0%AF%D0%B7%D1%8B%D0%BA%D0%BE%D0%B2%D0%B0%D1%8F_%D0%BB%D0%BE%D0%BA%D0%B0%D0%BB%D0%B8%D0%B7%D0%B0%D1%86%D0%B8%D1%8F), то есть возможность использовать те или иные значения в зависимости от выбраной культуры (языка).

Этот модуль оперирует в рамках трех типов сущностей:

* Словарь – набор значений;
* Культура – язык и его настройки;
* Значение или токен – непосредственно значение, которое используется.

`basis.l10n` позволяет изменять выбранную культуру без перезагрузки страницы. А в режиме разработки так же изменять словари и значения.

## Словарь

Словарь – это интерфейс к набору значений, сгруппированых по культуре.

Содержимое словарей хранится в отдельных файлах с расширением `.l10n` в формате JSON. Ключи первого уровня являются кодами культуры, а значение – набор значений для словаря.

```
{
  "en-US": {
    "hello": "Hello"
  },
  "ru-RU": {
    "hello": "Привет"
  }
}
```

Словари являются экземплярами класса `basis.l10n.Dictionary` и объявляется с помощью функции-хелпера `basis.l10n.dictionary`. Этой функции передается имя файла. Если для заданого имени уже существует словарь, то он возвращается, иначе создается новый.

```js
var myDict = basis.l10n.dictionary('path/to/dict.l10n');
```

Если расширение файла не соотвествует `.l10n`, то оно заменяется на `.l10n`. Таким образом, можно использовать `__filename` (имя файла модуля), если имя файла словаря отличается от имени файла модуля только расширением.

```js
var myDict = basis.l10n.dictionary(__filename);
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

За каждой культурой в словарях закрепляются определенные значения. Если определенного значения нет для заданной культуры, то значение может быть взято из значений для другой культуры. По умолчанию, такой культурой является первая в списке заданым `basis.l10n.setCultureList` (считается, что первая культура наиболее полная). Для любой культуры можно задать альтернативу, при объявлении списка культур. Для этого после обозначения культуры нужно поставить `/` (слеш) и далее указать обозначение альтернативной культуры. Можно задать только одну альтернативу, но при этом используется альтернативная культура альтернативной культуры и далее по цепочке.

```js
basis.l10n.setCultureList('en-US ru-RU uk-UK/ru-RU xx-XX/uk-UK');
// для ru-RU поиск будет ru-RU -> en-US
// для uk-UK: uk-UK -> ru-RU -> en-US
// для xx-XX: xx-XX -> uk-UK -> ru-RU -> en-US
```

Текущая культура определяет какой набор значений словаря должен использоваться. Ее код возвращает функция `basis.l10n.getCulture`. Текущая культура может быть изменена в любой момент, с помощью функции `basis.l10n.setCulture`, которой передается код культуры. Код культуры, задаваемой в качестве текущей, должен быть в списке культур, определенного функцией `basis.l10n.setCultureList`. При смене текущей культуры, словари обновляют свои значения согласной выбранной культуре и правилам альтернатив (это происходит без перезагрузки страницы).

```js
basis.l10n.setCulture('ru-RU');

console.log(basis.l10n.getCulture());
// console> 'ru-RU'
```

С помощью функции `basis.l10n.onCultureChange` можно задать функцию-обработчик на изменение текущей культуры.

```js
basis.l10n.onCultureChange(function(culture){
  console.log('Current culture is ', culture);
});

console.log(basis.l10n.getCulture());
// console> en-US

basis.l10n.setCulture('ru-RU');
// console> Current culture is ru-RU
```

Культуры являются экземплярами класса `basis.l10n.Culture`, которые содержат языковые настройки культуры. Экземпляр культуры можно получить с помощью функции-хелпера `basis.l10n.culture`. Эта функция возвращает культуру ассоциированную с заданым кодом, а если таковой нет, то создает ее.

Функция `basis.l10n.culture` расширена методами и свойствами [`basis.Token`](basis.Token.md). Поэтому в большинстве случаев может использоваться как экземпляр `basis.Token`, хотя таковым не является. Например, в качестве значения для биндига (так как имеет [binding]).

```js
var view = new basis.ui.Node({
  template: '<span>Current culture is {currentCulture}</span>',
  binding: {
    currentCulture: basis.l10n.culture
  }
});
```

Или как альтельнатива `onCultureChange`.

```js
basis.l10n.culture.attach(function(culture){
  console.log('Current culture is ', culture);
});
```

## Значения