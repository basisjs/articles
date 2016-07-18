# Build

Команда `build` производит сборку приложения.

Опции:

<!-- MarkdownTOC -->

- [Общие](#Общие)
  - [-b, --base &lt;path>](#-b---base-ltpath)
  - [-f, --file &lt;filename>](#-f---file-ltfilename)
  - [--preset](#--preset)
  - [-o, --output &lt;path>](#-o---output-ltpath)
  - [-t, --target &lt;target>](#-t---target-lttarget)
  - [-p, --pack](#-p---pack)
  - [--no-color](#--no-color)
  - [--verbose](#--verbose)
  - [--silent](#--silent)
  - [--warnings](#--warnings)
  - [--stat](#--stat)
- [CSS](#css)
  - [--css-pack](#--css-pack)
  - [-i, --css-inline-image &lt;max-size>](#-i---css-inline-image-ltmax-size)
  - [--css-optimize-names](#--css-optimize-names)
  - [--css-usage](#--css-usage)
- [JavaScript](#javascript)
  - [--js-cut-dev](#--js-cut-dev)
  - [--js-optimize-throws](#--js-optimize-throws)
  - [--js-pack](#--js-pack)
  - [--js-pack-cmd &lt;string>](#--js-pack-cmd-ltstring)
- [Misc](#misc)
  - [--l10n-package](#--l10n-package)
  - [--l10n-default-culture](#--l10n-default-culture)
  - [--tmpl-default-theme](#--tmpl-default-theme)
  - [--theme](#--theme)
  - [--same-filenames](#--same-filenames)
  - [--single-file](#--single-file)

<!-- /MarkdownTOC -->

## Общие

### -b, --base &lt;path>

Задает базовый путь. По умолчанию это локация файла конфигурации (`basis.config`) или текущая папка, если конфигурационный файл не найден или не используется (указан флаг `--no-config`).

Базовый путь так же используется для разрешения абсолютных путей в приложении. Другими словами, он ассоцируется с корнем сайта. Приложение не может ссылаться на файлы, которые располагаются не в рамках базового пути.

> Предположим, что базовый путь `/foo/bar/baz`. Если в приложении встретится, например, `basis.require('/path/to/file.ext')`, то такой путь будет преобразован в `/foo/bar/baz/path/to/file.ext`. Попытки "всплыть" выше игнорируются, например, для `basis.require('/../../path/to/file.ext')` будет по прежнему получен путь `/foo/bar/baz/path/to/file.ext`.

### -f, --file &lt;filename>

Указывает путь к индексному файлу. По умолчанию это `index.html` в базовой папке.

### --preset

### -o, --output &lt;path>

Указывает папку, где должен быть расположен результат. По умолчанию это `build` в базовой папке.

### -t, --target &lt;target>

Данная опция определяет какой в каком виде необходимо получить результат. Возможны следующие варианты:

- `fs` (по умолчанию) – результат в виде множества файлов, которые записываются на диск (файловую систему)
- `output-graph` – генерирует выходной граф файлов в формате `.dot`, который сохраняется в файл `output-graph.dot`
- `none` – не производить никакого результата; может быть полезно для определения, что основной процесс сборки происходит успешно (без ошибок), но сам результат при этом не нужен

### -p, --pack

Флаг сообщает сборщику, что необходимо получать оптимальную сборку, то есть сжимать резутат. Он является сокращением для `--js-cut-dev --js-pack --css-pack`. Следующие записи эквивалентны:

```
> basis build -p
> basis build --pack
> basis build --js-cut-dev --js-pack --css-pack
```

### --no-color

По умолчанию лог действий сборщика раскрашивает для лучшей читаемости. Это происходит только там, где поддерживаются `ansi` коды, главным образом при выводе в терминале или консоли (`tty`). Поддержка определяется автоматически. Опция `--no-color` позволяет принудительно запретить использовать цвета.

### --verbose

По умолчанию выводится только основная информаци о процессе сборки. Если необходимо получить детальную информацию о процессе, то используется флаг `--verbose`. Подробная информация позволяет полную картину того, что и как делает сборщик.

### --silent

### --warnings

По умолчанию, в информации о сборке выводится лишь общее количество предупреждающих сообщений (warning).

```
> basis build
Build with basisjs-tools@1.3.17 (65fa05dda9)
Index file: ./index.html
Output: ./build

...

Warnings: 1
Build done in 1.033s
```

Если указать опцию, то будет выведен список предупреждений.

```
> basis build --warnings
Build with basisjs-tools@1.3.17 (65fa05dda9)
Index file: ./index.html
Output: ./build

...

Warnings: 1
  template/foo.css
    * File `template/foo.css` not found (/abs/path/to/template/foo.css)
Build done in 1.066s
```

### --stat

## CSS

### --css-pack

Флаг указывает, что `CSS` должен быть сжат. Для этого используется библиотека [csso](https://github.com/css/csso) (она так же используется для получения `AST`, который анализируется и трансформируется).

Стили сжимаются как файлах, так и в атрибутах `style` (в `html` файлах и шаблонах).

### -i, --css-inline-image &lt;max-size>

Если задана эта опция, то сборщик заменяет в стилях ссылки на файлы равные или меньшие `max-size` на Data URI, то есть их base64 представление. Предположим, что для `max-size` задано значение `4096` (то есть `basis build -i 4096`) и размер `foo.png` меньше этого значения, тогда файл стилей:

```css
.foo {
  background: url(foo.png);
}
```

Примет следующий вид:

```css
.foo {
  background: url(data:image/png;base64,...);
}
```

### --css-optimize-names

Данная опция указывает сборщику, что имена классов должны быть сокращены. В этом случае, сборщик заменяет имена в `css`, `html` и шаблонах (файлах с расширением `.tmpl`) на более короткие. Обычно это одно- или двухбуквенные имена. Например, следующий файл стилей:

```css
.foo {}
.bar {}
.foo .bar {}
```

С включеной опцией примет вид:

```css
.a {}
.b {}
.a .b {}
```

Данная трансформация является небезопасной, и может применяться, если есть гарантия что имена классов не используются, например, в JavaScript коде.

### --css-usage

## JavaScript

### --js-cut-dev

Опция указывает сборщику вырезать код, помеченный как отладочный. Существуют два типа специальных отметок: `;;;` и `/** @cut ... */`. Такие метки и все, что находит правее них до конца строки, вырезаются. Например, код:

```js
// example
;;; console.log('debug');
/** @cut */ console.log('debug');
/** @cut some comment */ console.log('debug');
console.log('foo');
```

С включеной опцией примет вид:

```js
// example



console.log('foo');
```

### --js-optimize-throws

### --js-pack

### --js-pack-cmd &lt;string>

По умолчанию `google-closure-compiler --charset UTF-8`.

## Misc

### --l10n-package

### --l10n-default-culture

### --tmpl-default-theme

### --theme

### --same-filenames

### --single-file
