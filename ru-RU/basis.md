# Ядро (basis.js)

Ядром является основной javascript-файл, `src/basis.js`, единственный файл фреймворка подключаемый через тег `<script>`. Ядро предоставляет базовый функционал, обеспечивающий работу фреймворка и его модулей:

- Функции:
  - Утилитарные функции по работе с объектами, строками, числами, массивами и функциями
  - `basis.getter`
  - Функции по работе с путями (`basis.path`)
  - Обертка над консольными методами (`basis.dev`)
  - Выполнение кода в следующем фрейме (`basis.setImmediate`, `basis.clearImmediate`, `basis.nextTick`)
  - `basis.ready`
  - Polyfill'ы для `ES5` методов и функций: `Function#bind`, `Array.isArray`, `Array#indexOf`, `Array#lastIndexOf`, `Array#forEach`, `Array#map`, `Array#filter`, `Array#some`, `Array#every`, `Array#reduce`, `String#trim`, `Date.now`
  - Исправления методов для старых браузеров: `Array#splice`, `String#split`, `String#substr`
  - Хелперы для асинхронной работы с `document` (`basis.doc`)
  - `basis.json.parse`
- Обработка конфига (на данный момент конфиг – это значение атрибута `basis-config`), результат хранится в `basis.config`
- [Конструирование классов](ru-RU/basis.Class.md) `basis.Class`
- Модульность:
  - Пространства имен `basis.namespace`
  - [Ресурсы](ru-RU/resources.md): `basis.resource`, `basis.require`, `basis.asset`
- Класс [basis.Token](ru-RU/basis.Token.md)
- Утилизатор `basis.cleaner`
