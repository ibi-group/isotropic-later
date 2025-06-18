# isotropic-later

[![npm version](https://img.shields.io/npm/v/isotropic-later.svg)](https://www.npmjs.com/package/isotropic-later)
[![License](https://img.shields.io/npm/l/isotropic-later.svg)](https://github.com/ibi-group/isotropic-later/blob/main/LICENSE)
![](https://img.shields.io/badge/tests-passing-brightgreen.svg)
![](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)

A utility that provides a consistent interface for scheduling and managing asynchronous tasks with support for cancellation and promise-based workflows.

## Why Use This?

- **Unified API**: Consistent interface whether using callbacks or promises
- **Task Management**: Ability to cancel tasks, check completion status, and manage timer references
- **Timing Options**: Execute tasks with millisecond delays, immediately, or as soon as possible
- **Resource Management**: Support for unref/ref to allow Node.js process to exit if only unreferenced timers remain
- **Promise-Based**: Seamless integration with async/await when no callback is provided

## Installation

```bash
npm install isotropic-later
```

## Usage

```javascript
import _later from 'isotropic-later';

{
    // Basic usage with callback
    _later(1000, () => {
        console.log('This will execute after 1 second');
    });
}

{
    // Promise-based usage
    const promise = _later(2000);

    promise.then(() => {
        console.log('This will execute after 2 seconds');
    });
}

{
    // With async/await
    const example = async () => {
        await _later(3000);

        console.log('This will execute after 3 seconds');
    };
}

{
    // Cancel a scheduled task
    const cancellableTask = _later(5000, () => {
        console.log('This will never execute if cancelled');
    });

    cancellableTask.cancel();
}
```

## API

### later(milliseconds, [callback])

Schedules a task to execute after the specified delay.

#### Parameters

- `milliseconds` (Number): Delay in milliseconds before execution
  - If `> 0`: Uses `setTimeout` with the specified delay
  - If `= 0`: Uses `setImmediate` for faster execution
  - If `< 0`: Uses queueMicrotask for the quickest possible async execution
- `callback` (Function, optional): Function to execute after the delay
  - If omitted, returns a Promise that resolves after the delay

#### Returns

An object (or Promise with added properties) with the following properties and methods:

- `cancel()`: Cancels the scheduled task if it hasn't executed yet
- `cancelled` (Boolean): Indicates if the task has been cancelled
- `completed` (Boolean): Indicates if the task has been executed
- `hasRef()`: Returns whether the timer is preventing the Node.js process from exiting
- `ref()`: Makes the timer prevent the Node.js process from exiting (the default)
- `unref()`: Allows the Node.js process to exit even if this timer is still pending

### later.soon([callback])

Shorthand for `later(0, callback)`. Schedules a task to execute on the next event loop iteration using `setImmediate`.

#### Parameters

- `callback` (Function, optional): Function to execute on the next event loop iteration

#### Returns

Same as `later()`.

### later.asap([callback])

Shorthand for `later(-1, callback)`. Schedules a task to execute as soon as possible after the current event loop iteration.

#### Parameters

- `callback` (Function, optional): Function to execute as soon as possible

#### Returns

Same as `later()`.

## Examples

### Basic Timing Examples

```javascript
import _later from 'isotropic-later';

{
    // Execute after 1 second
    _later(1000, () => {
        console.log('1 second has passed');
    });

    // Execute on next event loop iteration
    _later.soon(() => {
        console.log('Executing soon');
    });

    // Execute as soon as possible after current code
    _later.asap(() => {
        console.log('Executing ASAP');
    });
}
```

### Promise-Based Usage

```javascript
import _later from 'isotropic-later';

{
    // With promises
    _later(1000)
        .then(() => console.log('1 second has passed'))
        .catch(() => console.log('This would only happen if cancelled'));

    // With async/await
    const delayedGreeting = async name => {
        console.log(`Hello ${name}!`);

        await _later(2000);

        console.log(`${name} is still here after 2 seconds`);
    };

    delayedGreeting('World');
}
```

### Task Cancellation

```javascript
import _later from 'isotropic-later';

{
    // Cancel a callback
    const task = _later(5000, () => {
        console.log('This will not execute');
    });

    console.log(`Task cancelled? ${task.cancelled}`); // false
    console.log(`Task completed? ${task.completed}`); // false

    // Cancel after 1 second
    _later(1000, () => {
        task.cancel();
        console.log(`Task cancelled? ${task.cancelled}`); // true
        console.log(`Task completed? ${task.completed}`); // false
    });
}

{
    // Cancel a promise
    const promise = _later(5000);

    promise.then(() => {
        console.log('This will not execute if cancelled');
    });

    _later(1000, () => {
        promise.cancel();
        // The promise will never resolve
    });
}
```

### Process Exit Control

```javascript
import _later from 'isotropic-later';

{
    // By default, Node.js won't exit until all timers complete
    const task = _later(60000, () => {
        console.log('This would keep the process alive for 1 minute');
    });

    // Allow Node.js to exit even with the pending timer
    task.unref();

    // Check if the timer is preventing exit
    console.log(task.hasRef()); // false

    // Make the timer prevent exit again
    task.ref();

    console.log(task.hasRef()); // true
}
```

### Sequence of Delayed Operations

```javascript
import _later from 'isotropic-later';

{
    // Sequential delayed operations with async/await
    const sequentialDelays = async () => {
        console.log('Starting sequence');

        await later(1000);
        console.log('After 1 second');

        await later(2000);
        console.log('After 3 seconds total');

        await later(3000);
        console.log('After 6 seconds total');
    }

    sequentialDelays();
}
```

## Contributing

Please refer to [CONTRIBUTING.md](https://github.com/ibi-group/isotropic-later/blob/main/CONTRIBUTING.md) for contribution guidelines.

## Issues

If you encounter any issues, please file them at https://github.com/ibi-group/isotropic-later/issues
