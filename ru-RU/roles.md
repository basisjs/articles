<!-- MarkdownTOC -->

- [Роли](#%D0%A0%D0%BE%D0%BB%D0%B8)
  - [Создание](#%D0%A1%D0%BE%D0%B7%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5)
    - [Особенности синтаксиса ролей в некоторых случаях](#%D0%9E%D1%81%D0%BE%D0%B1%D0%B5%D0%BD%D0%BD%D0%BE%D1%81%D1%82%D0%B8-%D1%81%D0%B8%D0%BD%D1%82%D0%B0%D0%BA%D1%81%D0%B8%D1%81%D0%B0-%D1%80%D0%BE%D0%BB%D0%B5%D0%B9-%D0%B2-%D0%BD%D0%B5%D0%BA%D0%BE%D1%82%D0%BE%D1%80%D1%8B%D1%85-%D1%81%D0%BB%D1%83%D1%87%D0%B0%D1%8F%D1%85)
  - [Инспектирование ролей](#%D0%98%D0%BD%D1%81%D0%BF%D0%B5%D0%BA%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5-%D1%80%D0%BE%D0%BB%D0%B5%D0%B9)
  - [Трекинг](#%D0%A2%D1%80%D0%B5%D0%BA%D0%B8%D0%BD%D0%B3)
    - [Tracking map](#tracking-map)
    - [Встроенная обработка событий ввода](#%D0%92%D1%81%D1%82%D1%80%D0%BE%D0%B5%D0%BD%D0%BD%D0%B0%D1%8F-%D0%BE%D0%B1%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%BA%D0%B0-%D1%81%D0%BE%D0%B1%D1%8B%D1%82%D0%B8%D0%B9-%D0%B2%D0%B2%D0%BE%D0%B4%D0%B0)
    - [Динамическое формирование описания](#%D0%94%D0%B8%D0%BD%D0%B0%D0%BC%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%BE%D0%B5-%D1%84%D0%BE%D1%80%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5-%D0%BE%D0%BF%D0%B8%D1%81%D0%B0%D0%BD%D0%B8%D1%8F)
    - [Примеры](#%D0%9F%D1%80%D0%B8%D0%BC%D0%B5%D1%80%D1%8B)

<!-- /MarkdownTOC -->

# Роли

Роль — это альтернатива идентификатора в DOM-дереве, дополнительный семантический уровень. Роли добавляются значимым элементам интерфейса с помощью специального атрибута-маркера.

Необходимость дополнительного семантического слоя обусловлена тем, что классические способы адресовать элементы в разметке, основанные на именах элементов, классах, идентификаторах и т.д., являются неустойчивыми к изменению разметки. Другими словами, при изменении разметки велика вероятность, что пути, основанные на CSS-селекторах, перестанут работать. Кроме того, при использовании, например, [изоляции стилей](https://github.com/basisjs/articles/blob/master/ru-RU/template/isolate-style.md) имена классов генерируются случайным образом и их практически невозможно использовать в селекторах. Роли позволяют размечать элементы компонентов, получая более простые и устойчивые к изменению разметки пути к ним.

Основные области применения ролей: отслеживание событий в интерефейсе (трекинг поведения пользователя) и обеспечение адресации для автоматизированных тестов.

[DEMO](http://basisjs.com/basisjs/demo/data/userlist-with-roles.html)

## Создание

Роль может быть назначена любому элементу разметки. Обычно роли прописываются для элементов, у которых есть атрибуты с префиксом [event-](https://github.com/basisjs/articles/blob/master/ru-RU/basis.ui_actions.md) (т.е. у которых слушаются события).

Значение роли всегда берётся из компонента (владельца шаблона) как значение специального биндинга `$role`. Роль назначается с помощью атрибута `b:role`. Главный элемент шаблона маркируется атрибутом `b:role` без значения.

*Шаблон*
```html
<div class="component" b:role/>
```

*Компонент*
```js
var component = new Node({
  role: 'foo',
  template: resource('./template/component.tmpl')
});
```

*Итоговая разметка*
```html
<div class="component" role-marker="foo"></div>
```

Второстепенные (или вспомогательные) элементы маркируются атрибутом `b:role` со значением. Например, если роль компонента `foo`, а в шаблоне задан атрибут `b:role="bar"`, то в итоговой разметке у элемента будет роль `foo/bar`.
Рассмотрим пример с диалогом. Основной блок диалога — это основной элемент. Вспомогательными элементами могут быть, например, кнопка закрытия диалога и подложка.

*Шаблон*
```html
<div class="dialog-wrapper" b:role="overlay">
  <div class="dialog" b:role>
    <button class="close-button" b:role="close-button">
      Close dialog
    </button>
  </div>
</div>
```

*Компонент*
```js
var dialog = new Node({
   role: 'dialog',
   template: resource('./template/dialog.tmpl')
});
```

*Итоговая разметка*
```html
<div class="dialog-wrapper" role-marker="dialog/overlay">
  <div class="dialog" role-marker="dialog">
    <button class="close-button" role-marker="dialog/close-button">
      Close dialog
    </button>
  </div>
</div>
```

>Только у одного элемента в шаблоне может быть атрибут `b:role` без значения, в противном случае это может привести к конфликтам путей — таких ситуаций стоит избегать.

Особый случай – повторяющиеся компоненты, такие как элементы списка. Для них нельзя задать уникальную роль, но у каждого элемента обычно есть некоторое уникальное значение, например, идентификатор. В таких случаях используется свойство `roleId`, которое определяет, какой биндинг описывает идентификатор. Важно, чтобы указанный биндинг был определен, иначе роль не будет проставлена.

*Шаблон*
```html
<ul class="menu" b:role/>
```

```html
<li class="menu-item" b:role>
  <span b:role="caption">{id}</span>
</li>
```

*Компонент*
```js
var menu = new Node({
  role: 'menu',
  template: resource('./template/menu.tmpl'),
  childClass: {
    role: 'item',
    roleId: 'id',
    template: resource('./template/menu-item.tmpl')
  },
  childNodes: [
    { id: 'foo' },
    { id: 'bar' },
    { id: 'baz' }
  ]
});
```

Такое описание позволит сгенерировать для каждого дочернего элемента уникальную роль вида `item(id)` (для основного элемента) или `item(id)/subrole` (для второстепенных элементов).

*Итоговая разметка*
```html
<ul class="menu" role-marker="menu">
  <li class="menu-item" role-marker="item(foo)">
    <span role-marker="item(foo)/caption">foo</span>
  </li>
  <li class="menu-item" role-marker="item(bar)">
    <span role-marker="item(bar)/caption">foo</span>
  </li>
  <li class="menu-item" role-marker="item(baz)">
    <span role-marker="item(baz)/caption">foo</span>
  </li>
</ul>
```


### Особенности синтаксиса ролей в некоторых случаях

В `<b:include>` можно задать роль для корневого элемента подключаемого фрагмента. В этом случае префикс `b:` для атрибута `role` не указывается.

```
<b:include src="..." role="foo"/>
```

Во всех остальных случаях префикс `b:` является обязательным. Например, для `<b:svg>` префикс обязателен, иначе он не будет распознан как специальный.

```
<b:svg src="..." b:role="baz"/>
```

Чтобы необходимо установить, изменить или удалить роль в подключаемом шаблоне, необходимо использовать инструкции `<b:role>` (или `<b:set-role>`) и `<b:remove-role>`.

```
<b:include src="...">
  <b:role ref="name" value="foo"/>
  <b:remove-role ref="another-name"/>
</b:include>
```

> Для части компонент в `basis.js` еще не прописаны роли. Это будет исправлено в будущем. Вы можете помочь, расставив роли в шаблоне и сделав PR в [репозитории basisjs](https://github.com/basisjs/basisjs).

## Инспектирование ролей

Для тестирования и трекинга нужны ролевые пути.
**Ролевые пути** — уникальные пути из цепочки роль-маркеров, по которым можно однозначно определить элемент на странице (по аналогии с XPath).

Для определения ролевых путей и работы с ролями в [панели разработчика](https://chrome.google.com/webstore/detail/basisjs-devtools/paeokpmlopbdaancddhdhmfepfhcbmek) basisjs есть специальные режимы — **инспектор ролей** (R с лупой) и **базовый режим отображения ролей** (Roles).

<img src="https://s16.postimg.org/7ioikngo5/basistoolsroles.png" alt="basisjs-devtools" width="500">

В обоих режимах включается отображение ролей и трекинга на странице, которые подсвечиваются блоками определенных цветов:

- серый (1) — роль есть, трекинг не ведётся
- зеленый (2) — роль и трекинг есть
- красный (3) — есть некоторые проблемы:
    * у элемента есть атрибут с префиксом `event-`, но не задана роль
    * конфликт путей (на странице есть элемент с таким же путем)
    * и другие ошибки

<img src="https://s21.postimg.org/5ijc0zt4n/roles_2.png" alt="roles indicators" width="500">

#### Инспектор ролей

<img src="https://s13.postimg.org/go7atewp3/inspector.png" alt="devtools - roles pick inspector" height="30">
– детальное инспектирование отдельных ролей

Особенности:
При нажатии на элемент в режиме инспектирование ролей открывается модальное окно, в котором отображается ролевой путь до конкретного элемента, информация по трекингу и дерево элементов с ролями на странице (можно выбрать интересующий элемент и увидеть детали: полный путь к элементу и подробности трекинга).

<img src="https://s22.postimg.org/8lc7i3v1t/inspectroles.png" alt="role paths and tracking info" height="450">

#### Roles

<img src="https://s21.postimg.org/xbntmlqyv/roles3434.png" alt="devtools - roles view" height="30">
– базовый режим отображение ролей

При активации этого режима при взаимодействии с элементом всплывает окно с информацией по трекингу. Тип взаимодействия зависит от того, какое событие было прописано для активации трекинга.

<img src="https://s16.postimg.org/unuqot611/amplitudeinfo.png" alt="tracking info" height="90">

## Трекинг

Модуль `basis.tracker` упрощает отслеживание событий в интерфейсе.

Для того, чтобы начать собирать события, необходимо:

1. Добавить обработчик событий
2. Подключить карту трекинга (tracking map)

```js
var tracker = require('basis.tracker');

// добавляем обработчик
tracker.attach(function(info){
  // функция срабатывает, когда для заданного пути в карте сработало событие, которое нас интересует
  // info - объект содержащий информацию о пути, событии и пданных
});

// загружаем карту
tracker.loadMap({
  'role path': {
    click: {
      some: 'data'
    }
  }
});
```

Метод `loadMap` может быть вызван произвольное количество раз. Так модули могут загружать свой фрагмент карты событий, для той части интерфейса, что они описывают. Карты можно хранить в отдельных файлах:

```js
tracker.loadMap(require('./tracking-map.js'));
```

### Tracking map

Что описывается:

* ролевые пути до компонентов
* какие события нужно отслеживать (например, клики по ссылкам или ввод текста)
* какую информацию логировать при наступлении этих событий
* куда отправлять эту информацию

*Пример содержимого:*

```js
module.exports = {
  // главная роль страницы, отправляет отчет о показе страницы
  'example-page': {
    show: {
      trackingService: 'Example - View page'
    }
  },
  // событие keydown на поле ввода инициирует отправку отчета
  // 'Example - Change value' в сторонний трекинг-сервис
  'example-page input': {
    keydown: {
      trackingService: 'Example - Change value'
    }
  },
  // клик на второстепенный элемент-переключатель у поля ввода
  // отправит отчет 'Example - Toggle status'
  'example-page input/toggle': {
    click: {
      trackingService: 'Example - Toggle status'
    }
  }
}
```

Можно дополнительно передавать параметры. Это особенно актуально для повторяющихся компонентов.

*Пример (сокращенная запись, вместо звёздочки подставится значение из биндинга)*
```js
module.exports = {
  'example-page menu(*)/item': {
    click: {
      trackingService: {
        id: 'Example - Toggle sell/rent',
        params: {
          value: '*'
        }
      }
    }
  }
}
```

*Эквивалентно следующему описанию*
```js
module.exports = {
  'example-page menu(foo)/item': {
    click: {
      trackingService: {
        id: 'Example - Select menu-item',
        params: {
          value: 'foo'
        }
      }
    }
  },
  'example-page menu(bar)/item': {
    click: {
      trackingService: {
        id: 'Example - Select menu-item',
        params: {
          value: 'bar'
        }
      }
    }
  },
  'example-page menu(baz)/item': {
    click: {
      trackingService: {
        id: 'Example - Select menu-item',
        params: {
          value: 'baz'
        }
      }
    }
  }
}
```

### Встроенная обработка событий ввода

Для пользовательских браузерных событий `keyup`, `keydown`, `keypress`, `input` описание, которое будет отправлено в некоторый trackingService,
расширяется свойством `inputValue`, равным `event.target.value`.

### Динамическое формирование описания

Начиная с версии 10.3.0 ([коммит](https://github.com/basisjs/basisjs/commit/dc9de238700c1c18baa975009a5bf0a0bca1456b)) можно воспользоваться функцией `transformWithUIEvent`.

Пример:
```
    ...
    'input/password': {
        input: {
            transformWithUIEvent: function(data, event){
                return {
                    trackingService: {
                        id: 'input password input'
                        valueStat: event.target.value.length
                    }
                };
            }
        }
    },
    ...
```
Для элемента на странице, которые ищется по xpath-like строке `'input/password'`, будет логироваться обычное браузерное событие `input`.
Когда событие произойдет, будет вызвана функция, описанная в свойстве `transformWithUIEvent`.
Значение `valueStat` в демонстрационных целях формируется из объекта `event`. С тем же успехом можно было написать `valueStat: data.inputValue.length`, учитывая, что в этом примере трекается событие ввода, для которого есть `data.inputValue`.

### Примеры
[Пример карты трекинга](https://github.com/basisjs/basisjs/blob/master/demo/data/userlist-with-roles-tracking-map.js) для [демо-страницы с ролями](http://basisjs.com/basisjs/demo/data/userlist-with-roles.html), в исходном коде можно посмотреть описание конфигурация трекинга. В самом демо можно открыть консоль в панели разработчика, прокликать элементы списка и увидеть отчет трекинга.
