# Роли

Роль — это альтернатива пути в DOM-дереве, дополнительный семантический уровень. Роли добавляются значимым элементам интерфейса с помощью специального атрибута-маркера.

Необходимость дополнительного семантического слоя обусловлена тем, что классические способы адресовать элементы в разметке, основанные на именах элементов, классах, идентификаторов и т.д., являются неустойчивыми к изменению разметки. Другими словами, при изменении разметки велика вероятность, что пути основанные на CSS селекторах перестанут работать. Кроме того, при использовании, например, [изоляции стилей](https://github.com/basisjs/articles/blob/master/ru-RU/template/isolate-style.md) имена классов генерируются автоматически и практически невозможно использовать в селекторах. Роли позволяют размечать элементы компонентов и получать более простые и устойчивые к изменению разметки пути.

Основные области применения ролей: отслеживание событий в интерефейсе (трекинг поведения пользователя) и обеспечение адресации для автоматизированных тестов.

[DEMO](http://basisjs.com/basisjs/demo/data/userlist-with-roles.html)

## Создание

Роль может быть назначена любому элементу разметки. Но обычно роли прописываются для элементов, у которых есть атрибуты с префиксом [event-](https://github.com/basisjs/articles/blob/master/ru-RU/basis.ui_actions.md) (т.е. слушаются события).


Значение роли всегда приходит из компонента (владельца шаблона) в качестве значения специального биндинга. Роль назначается с помощью атрибута `b:role`. Главный элемент шаблона маркируется атрибутом `b:role` без значения. 


#### Пример 1
*В шаблоне*
```html
<div class="component" b:role/>
```


*Во владельце шаблона*
```js
var component = new Node({
    role: 'foo',
    template: resource('./template/component.tmpl')
});
```


*В итоговой разметке*
```html
<div class="component" role-marker="foo"></div>
```

Второстепенные (или вспомогательные) элементы могут маркироваться атрибутом `b:role` со значением.  Например, если роль компонента `foo`, а в шаблоне задан атрибут `b:role="bar"`, то в итоговой разметке у элемента будет роль `foo/bar`.
Рассмотрим пример с диалогом. Основной блок диалога — это основной элемент. Вспомогательными элементами могут быть, например, кнопка закрытия диалога или подложка.


#### Пример 2
*В шаблоне*
```html
<div class="dialog-wrapper" b:role="overlay">
    <div class="dialog" b:role>
        <button class="close-button" b:role="close-button">
            Close dialog
        </button>
    </div>
</div>
```


*Во владельце шаблона*
```js
var dialog = new Node({
   role: 'dialog',
   template: resource('./template/dialog.tmpl')
});
```


*В итоговой разметке*
```html
<div class="dialog-wrapper" role-marker="dialog/overlay">
    <div class="dialog" role-marker="dialog">
        <button class="close-button" role-marker="dialog/close-button">
            Close dialog
        </button>
    </div>
</div>
```

Только у одного элемента в шаблоне может быть атрибут `b:role` без значения, в противном случае это может привести к конфликтам путей — таких ситуаций стоит избегать.


Особый случай – повторяющиеся компоненты, например, элементы списка. Для них нельзя задать уникальную роль, но у каждого обычно есть некоторое уникальное значение, например, идентификатор. В таких случаях используется свойство `roleId`, которое определяет, какой биндинг описывает идентификатор. Важно, чтобы такой указанный биндинг был определен, иначе роль не будет проставлена.

#### Пример 3
*В шаблонах*
```html
<ul class="menu" b:role/>
```

```html
<li class="menu-item" b:role="item"/>
```


*Во владельце шаблонов*
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


*В итоговой разметке*
```html
<ul class="menu" role-marker="menu">
    <li class="menu-item" role-marker="menu(foo)/item"></li>
    <li class="menu-item" role-marker="menu(bar)/item"></li>
    <li class="menu-item" role-marker="menu(baz)/item"></li>
</ul>
```
       
## Инспектирование ролей

После того как страница размечена маркерами, можно заняться тестированием и трекингом. Для того и для другого нужны уникальные пути из цепочки роль-маркеров, по которым можно однозначно определить элемент на странице (похоже на работу с XPath).
Для определения ролевых путей и, в принципе, работы с ролями в [панели разработчика](https://chrome.google.com/webstore/detail/basisjs-devtools/paeokpmlopbdaancddhdhmfepfhcbmek) basisjs есть специальные режимы — **инспектор ролей** (R с лупой) и **базовый режим отображения ролей** (Roles).

<img src="https://s16.postimg.org/7ioikngo5/basistoolsroles.png" alt="basisjs-devtools" width="500">

В обоих режимах включается отображение ролей и трекинга на странице, которые подсвечиваются блоками определенных цветов:
- серый (1) — роль есть, трекинг не ведётся
- зеленый (2) — роль и трекинг есть
- красный (3) — есть некоторые проблемы: 
  1) у элемента есть `event-`, но нет роли
  2) есть конфликт ролей (не уникальный ролевой путь)
  3) другие ошибки, например, `miss: event` (если вам удастся воспроизвести ее появление — напишите об этом в [issues](https://github.com/basisjs/basisjs/issues) basisjs)

<img src="https://s21.postimg.org/5ijc0zt4n/roles_2.png" alt="roles indicators" width="500">

#### Инспектор ролей
<img src="https://s13.postimg.org/go7atewp3/inspector.png" alt="devtools - roles pick inspector" height="30">
– детальное инспектирование отдельных ролей

Особенности:
При нажатии инспектором ролей на элемент открывается модальное окно, в котором отображается ролевой путь до конкретного элемента, информация по трекингу и в целом показывается структура ролей на странице (роли в структуре кликабельные — можно также увидеть полный путь к элементу и подробности трекинга)
####


<img src="https://s22.postimg.org/8lc7i3v1t/inspectroles.png" alt="role paths and tracking info" height="450">

#### Roles
<img src="https://s21.postimg.org/xbntmlqyv/roles3434.png" alt="devtools - roles view" height="30">
– базовый режим отображение ролей 

При активации этого режима при взаимодействии с элементом всплывает окно с информацией по трекингу. Тип взаимодействия зависит от того, какое именно событие было прописано для активации трекинга.

####
<img src="https://s16.postimg.org/unuqot611/amplitudeinfo.png" alt="tracking info" height="90">

## Трекинг
В basisjs есть встроенный инструмент для трекинга `basis.tracker`, который эффективно отслеживает наступление событий. 

[исходный код](https://github.com/basisjs/basisjs/blob/master/src/basis/tracker.js)

###API basis.tracker
TODO

Каким образом запустить трекинг?
1) создать карту трекинга (tracking map)
2) описать конфигурацию (что должно происходить при срабатывании хендлеров `basis.tracker` — например, отправка отчетов в консоль)
3) подключить в приложении карту при помощи функции `loadMap()`

```js
basis.tracker.loadMap(require('./tracking-map.js'));
```

###Tracking map
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


Можно дополнительно передавать параметры и особенно это актуально для повторяющихся компонентов.
 
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

*эквивалентно этому*
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

Еще [пример карты трекинга](https://github.com/basisjs/basisjs/blob/master/demo/data/userlist-with-roles-tracking-map.js) для [демо-страницы с ролями](http://basisjs.com/basisjs/demo/data/userlist-with-roles.html).

В самом демо можно открыть консоль в панели разработчика, покликать по элементам списка и увидеть отчеты трекинга.
В исходном коде описана конфигурация трекинга.

###Конфигурация трекинга
TODO