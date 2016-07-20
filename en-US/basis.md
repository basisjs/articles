# Core (basis.js)

Core is a single javascript-file `src/basis.js`. It is included with a `<script>` tag. The core provides basic functionality to maintain the framework and its modules:

- Functions:
  - Utility functions to work with objects, strings, numbers, arrays and functions
  - `basis.getter`
  - Functions to work with paths (`basis.path`)
  - Console methods wrapper (`basis.dev`)
  - Execute code in the next frame (`basis.setImmediate`, `basis.clearImmediate`, `basis.nextTick`)
  - `basis.ready`
  - Polyfills for `ES5` methods and functions: `Function#bind`, `Array.isArray`, `Array#indexOf`, `Array#lastIndexOf`, `Array#forEach`, `Array#map`, `Array#filter`, `Array#some`, `Array#every`, `Array#reduce`, `String#trim`, `Date.now`
  - Fixed methods for old browsers : `Array#splice`, `String#split`, `String#substr`
  - Helpers for async work with `document` (`basis.doc`)
  - `basis.json.parse`
- Config processing (for now config is a value of a `basis-config` attribute), the result is stored in `basis.config`
- [Class construction](en-US/basis.Class.md) `basis.Class`
- Modularity:
  - Namespaces `basis.namespace`
  - [Resources](en-US/resources.md): `basis.resource`, `basis.require`, `basis.asset`
- Class [basis.Token](en-US/basis.Token.md)
- Garbage collector `basis.cleaner`
