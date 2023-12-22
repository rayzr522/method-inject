# method-inject

> A simple system for injecting and transforming methods

## Installation

```bash
yarn add method-inject
```

```bash
npm install --save method-inject
```

## Usage

To use method-inject, it's as simple as calling it on a method:

```javascript
const inject = require("method-inject");

// Transform the first argument and prepend '[INFO] ' to it
const log = inject(console.log).transform(0, (text) => "[INFO] " + text);

log("Hello, there!");
// => [INFO] Hello, there!
```

There are several methods, the rest of which are shown below:

```javascript
const inject = require("method-inject");
const someObject = {
  buggedMethod(someArg) {
    console.log(someArg + 1);
  },
};

// Hmm, we've been getting `NaN` in the console from someObject.buggedMethod, let's check it out:
someObject.buggedMethod = inject(someObject.buggedMethod, someObject).before(
  (args) => console.log("buggedMethod called with the following args:", args)
);
// Note that we passed someObject as the second parameter to inject, indicating that the method should be bound to that object.

// Problem code:
someObject.buggedMethod("ERRORS");
// => buggedMethod called with the following args: [ 'ERRORS' ]
// => NaN
```

```javascript
const inject = require('method-inject');

const db = {
    internal: {
        life: 42
    },
    get(key, default) {
        return this.internal[key] || default;
    }
};

if (process.env.DB_VERBOSE) {
    db.get = inject(db.get, db).after((returnValue, args) => {
        console.log(`DB::GET(key=${args[0]},default=${args[1] || 'none'}) -> ${returnValue}`);
    });
}

// Assuming DB_VERBOSE=true:
console.log(`The meaning of life is ${db.get('life', -1)}`);
// => DB::GET(key=life,default=-1) -> 42
// => The meaning of life is 42
```

```javascript
const inject = require("method-inject");

const multiply = (a, b) => {
  return a * b;
};

const multiplyAndSquare = inject(multiply).transformOutput(
  (output) => output * output
);

// (2 * 3) * (2 * 3) = 6 * 6 = 36
console.log(multiplyAndSquare(2, 3));
// => 36
```

Methods can also be chained indefinitely:

```javascript
const inject = require("method-inject");

const multiply = (a, b) => a * b;
const addOne = (x) => x + 1;
const square = (x) => x * x;

const verboseComplexMath = inject(multiply)
  .after((output) => console.log(`COMPLEX_CALC -> ${output}`))
  .transformOutput(addOne)
  .transformOutput(square);

console.log(verboseComplexMath(4, 5));
// => COMPLEX_CALC -> 441
// => 441
```
