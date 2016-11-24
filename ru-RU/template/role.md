# Роли

К значимым элементам интерфейса следует добавлять специальные маркеры — роли.
Роль — это альтернатива пути в DOM-дереве, дополнительный семантический уровень у элементов.

Используя роли, разработчики приобретают удобный инструмент для отслеживания поведения пользователей на сайте (трекинг) и для автоматического тестирования, независимый от классической разметки.

## Создание
В основном, роли прописываются для элементов, на которых слушаются события (т.е. у которых есть атрибуты с префиксом [event-](https://github.com/basisjs/articles/blob/master/ru-RU/basis.ui_actions.md)), но также могут прописываться для любых других значимых элементов.


В шаблоне главный элемент компонента маркируется атрибутом `b:role`. Значение роли всегда приходит из описания компонента (владельца шаблона), это значение специального биндинга.

**В шаблоне**
```
<div class="component" b:role></div>
```


**Во владельце шаблона** *(упрощенный вариант)*
```
var component = new Node({
     role: 'foo',
     template: resource('./template/component.tmpl'),
 });
```

*(определение роли через биндинг)*
```
var component = new Node({
     role: 'foo',
     template: resource('./template/component.tmpl'),
     binding: {
        foo: 'data:foo'
 });
```


**В итоговой разметке**
```
<div class="component" role-marker="foo"></div>
```

Второстепенные/вспомогательные элементы могут маркироваться атрибутом `b:role` со значением. Например, если у владельца роль foo и атрибут `b:role="bar"`, то в итоговой разметке у элемента будет роль `foo/bar`.
Пример — диалог: есть основной элемент — сам блок диалога, есть вспомогательные, например, кнопка закрыть диалог или подложка.

**В шаблоне**
```
<div class="dialog-wrapper" b:role="overlay">
    <div class="dialog" b:role>
        <button class="close-button" b:role="close-button">
            Close dialog
        </button>
    </div>
</div>
```

**Во владельце шаблона**
```
var dialog = new Node({
     role: 'dialog',
     template: resource('./template/dialog.tmpl')
 });
```

**В итоговой разметке**
```
<div class="dialog-wrapper" role-marker="dialog/overlay">
    <div class="dialog" role-marker="dialog">
        <button class="close-button" role-marker="dialog/close-button">
            Close dialog
        </button>
    </div>
</div>
```

В идеале только у одного элемента в шаблоне может быть атрибут b:role без значения, в противном случае это может привести к конфликтам путей — таких ситуаций стоит избегать.


Особый случай повторяющиеся компоненты, например, элементы списка. Для них нельзя задать уникальную роль, но у каждого обычно есть некоторое уникальное значение, например, идентификатор. В таких случаях используется свойство `roleId`, которое определяет какой биндинг описывает идентификатор. Важно, чтобы такой указанный биндинг был определен, иначе роль не будет проставлена.

**В шаблонах**
```
<ul class="menu" b:role></ul>
```

```
<li class="menu-item" b:role="item"></li>
```

**Во владельце шаблонов**
```
var menu = new Node({
    role: 'menu',
    template: resource('./template/menu.tmpl'),
    childClass: {
        role: 'item',
        roleId: 'id',
        template: templates.menuItem,
        binding: {
            id: 'id'    
        }
    }
    childNodes: [
        { id: 'foo' },
        { id: 'bar' },
        { id: 'baz' }
     ]
});
```

Это позволило сгенерировать уникальную роль для каждого дочернего элемента. Роль имеет вид `item(id)` или `item(id)/subrole` для второстепенных элементов.

**В итоговой разметке**
```
<ul class="menu" role-marker="menu">
    <li class="menu-item" role-marker="menu(foo)/item"></li>
    <li class="menu-item" role-marker="menu(bar)/item"></li>
    <li class="menu-item" role-marker="menu(baz)/item"></li>
</ul>
```

       
## Инспектирование ролей

В панели разработчика basisjs есть специальные режимы для работы с ролями — **инспектор ролей** (R с лупой) и **базовый режим отображения ролей** (Roles).

<img src="https://s16.postimg.org/7ioikngo5/basistoolsroles.png" alt="alt text" width="500">

В обоих режимах включается отображение ролей и трекинга на странице, которые подсвечиваются блоками определенных цветов:
- серый (1) — роль есть, трекинг не ведётся
- зеленый (2) — роль и трекинг есть
- красный (3) — есть некоторые проблемы: например, у элемента есть `event-`, но нет роли, или есть конфликт ролей (не уникальный путь к компоненту)

<img src="https://s21.postimg.org/5ijc0zt4n/roles_2.png" alt="alt text" width="500">

#### Инспектор ролей
<img src="https://s13.postimg.org/go7atewp3/inspector.png" alt="alt text" height="30">
– детальное инспектирование отдельных ролей

Особенности:
При нажатии инспектором ролей на элемент открывается модальное окно, в котором отображается ролевой путь до конкретного элемента, информация по трекингу и в целом показывается структура ролей на странице (роли в структуре кликабельные — можно также увидеть полный путь к элементу и подробности трекинга)
<img src="https://s22.postimg.org/8lc7i3v1t/inspectroles.png" alt="alt text" height="450">

#### Roles
<img src="https://s21.postimg.org/xbntmlqyv/roles3434.png" alt="alt text" height="30">
– базовый режим отображение ролей 

При активации этого режима при взаимодействии с элементом всплывает окно с информацией по трекингу. Тип взаимодействия зависит от того, какое именно событие было прописано для активации трекинга.

<img src="https://s16.postimg.org/unuqot611/amplitudeinfo.png" alt="alt text" height="90">

## Tracking map
Конфигурация трекинга. Создается js-файл (например, `tracking-map.js`) и подключается в `index.js` при помощи функции `loadMap()`:
```
require('app:event-tracking.js').loadMap(require('./tracking-map.js'));
```

*Пример содержимого:*

```
module.exports = {
    // главная роль страницы, отправляет отчет о показе страницы
    'example-page': {
        show: ['pageview', '/page']
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
 
*Пример (сокращенная запись, вместо `*` подставится значение из биндинга)*
```
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

```

*эквивалентно этому*
```
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
```