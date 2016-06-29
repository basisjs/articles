Данный репозитарий содержит статьи относящиеся к разработке на basis.js и описывающие его устройство.

[Сборка статей в виде книги](//basisjs.github.io/articles/ru-RU/)

## Содержание

* [Приступая к разработке](ru-RU/get-started.md)
* [Ядро](ru-RU/basis.md) (basis.js)
    * [Конфигурация](ru-RU/config.md)
    * [Классы](ru-RU/basis.Class.md)
    * [Модульность](ru-RU/resources.md)
    * [basis.Token](ru-RU/basis.Token.md)
    * basis.getter
    * [Binding bridge](ru-RU/bindingbridge.md)
* [basis.event](ru-RU/basis.event.md)
* [basis.data](ru-RU/basis.data.md)
    * [Скаляр](ru-RU/basis.data.Value.md)
    * [Объект](ru-RU/basis.data.Object.md)
    * [Набор](ru-RU/basis.data.datasets.md)
    * [Карта](ru-RU/basis.data.map.md)
* [basis.data.dataset](ru-RU/basis.data.dataset.md)
    * [Merge](dataset/merge.md) - объединение по правилу
    * [Subtract](dataset/subtract.md) - вычитание
    * [MapFilter](dataset/mapfilter.md) - конвертация и/или фильтрация
    * [Filter](dataset/filter.md) - фильтрация (подмножество)
    * [Slice](dataset/slice.md) - срез
    * [Split](dataset/split.md) - разбиение 1:1 (группировка)
    * [Cloud](dataset/cloud.md) - разбиение 1:M
    * [Extract](dataset/extract.md) - разворачивание
* basis.data.value
* basis.data.index
* basis.entity
* [basis.dom.wrapper](ru-RU/basis.dom.wrapper.md)
    * [DOM](ru-RU/basis.dom.wrapper_dom.md)
    * [Управление дочерними узлами](ru-RU/basis.dom.wrapper_childNodes.md)
        * [Сортировка](ru-RU/basis.dom.wrapper_sorting.md)
        * [Группировка](ru-RU/basis.dom.wrapper_grouping.md) \[todo:complete]
    * [Привязка данных](ru-RU/basis.dom.wrapper_data.md)
    * [Паттерн "владелец"](ru-RU/basis.dom.wrapper_owner.md) \[todo:examples]
    * [Сателлиты](ru-RU/basis.dom.wrapper_satellite.md)
    * [Доступность (disabled/enabled)](ru-RU/basis.dom.wrapper_disabled.md)
    * [Выделение (selection)](ru-RU/basis.dom.wrapper_selection.md)
* [basis.ui](ru-RU/basis.ui.md)
    * [Привязка шаблонов](ru-RU/basis.ui_template.md)
    * [Биндинги (bindings)](ru-RU/basis.ui_bindings.md)
    * [Обратная связь (actions)](ru-RU/basis.ui_actions.md)
* [basis.template](ru-RU/basis.template.md)
    * [Формат шаблонов](ru-RU/basis.template_format.md)
        * [`<b:l10n>`](ru-RU/template/b-l10n.md)
        * [`<b:style>`](ru-RU/template/b-style.md)
        * [`<b:isolate>`](ru-RU/template/b-isolate.md)
        * [`<b:define>`](ru-RU/template/b-define.md)
        * [`<b:text>`](ru-RU/template/b-text.md)
        * [`<b:include>`](ru-RU/template/b-include.md)
        * [Специальные атрибуты](template/atrtibute.md)
    * [Правила применения значений биндингам](ru-RU/basis.template_bindings.md)
    * [Темы](ru-RU/basis.template_theme.md)
* [basis.l10n](ru-RU/basis.l10n.md)
* [basis.net](ru-RU/basis.net.md)
    * [basis.net.ajax](ru-RU/basis.net.ajax.md)
    * basis.net.jsonp
    * basis.net.soap
    * basis.net.upload
    * [basis.net.action](ru-RU/basis.net.action.md)
    * [basis.net.service](ru-RU/basis.net.service.md)
* [basis.router](ru-RU/basis.router.md)
* [basisjs-tools](ru-RU/basisjs-tools/index.md) (консольный инструмент)
    * create
    * server
    * build
    * extract
* [Руководство](ru-RU/tutorial/index.md)
    * [Часть 1. Начало работы, представления, модули, инструменты](ru-RU/tutorial/part1/index.md)
