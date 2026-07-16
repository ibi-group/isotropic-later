# isotropic-later

[![npm version](https://img.shields.io/npm/v/isotropic-later.svg)](https://www.npmjs.com/package/isotropic-later)
[![License](https://img.shields.io/npm/l/isotropic-later.svg)](https://github.com/ibi-group/isotropic-later/blob/main/LICENSE)
![](https://img.shields.io/badge/tests-passing-brightgreen.svg)
![](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)

A utility that provides a consistent interface for scheduling and managing asynchronous tasks with support for cancellation and promise-based workflows.

## Why Use This?

- **Unified API**: Consistent interface whether using callbacks or promises
- **Task Management**: Ability to cancel tasks, check completion status, and manage timer references
- **Flexible Cancellation**: Cancel manually, or via an `AbortSignal`, or automatically with a `using` declaration
- **Timing Options**: Execute tasks with millisecond delays, immediately, or as soon as possible
- **Resource Management**: Support for unref/ref to allow Node.js process to exit if only unreferenced timers remain
- **Promise-Based**: Seamless integration with async/await when no callback function is provided

## Installation

```bash
npm install isotropic-later
```

## Usage

```javascript
import _later from 'isotropic-later';

{
    // Basic usage with callback function
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
    const cancelableTask = _later(5000, () => {
        console.log('This will never execute if canceled');
    });

    cancelableTask.cancel();
}
```

## API

### later(duration, [callbackFunction])

Schedules a task to execute after the specified delay.

#### Parameters

- `duration` (Number | Temporal.Duration): Delay before execution. A number is interpreted as milliseconds.
  - If `> 0`: Uses `setTimeout` with the specified delay
  - If `= 0`: Uses `setImmediate` for faster execution
  - If `< 0`: Uses queueMicrotask for the quickest possible async execution
- `callbackFunction` (Function, optional): Function to execute after the delay
  - If omitted, returns a Promise that resolves after the delay

#### Returns

An object (or Promise with added properties) with the following properties and methods:

- `cancel(options)`: Cancels the scheduled task if it hasn't executed yet. When a callback function was provided, the callback function will not be called. When no callback function was provided, the returned promise will either reject or remain unsettled.
  - `options` (Object, optional): Configuration object.
    - `reason` (Error, optional): The returned promise rejects with this error. If omitted, the promise rejects with a `CanceledError`. This value is not used if a callback function was passed to later.
    - `signal` (AbortSignal, optional): If already aborted, the returned promise rejects with an `AbortError`; otherwise the signal is registered so the timer is canceled if and when it aborts.
    - `silent` (Boolean, optional): If set to true, the returned promise will not reject when the timer is canceled. It will remain unsettled, never resolved or rejected. Default: `false`
  - May be called more than once with different signals; the task is canceled when any one of them aborts. Aborting after the task has already been canceled or completed has no effect.
  - Returns the handle, so it can be chained: `const promise = _later(duration).cancel({ signal });`
- `canceled` (Boolean): Indicates if the task has been canceled
- `completed` (Boolean): Indicates if the task has been executed
- `hasRef()`: Returns whether the timer is preventing the Node.js process from exiting
- `ref()`: Makes the timer prevent the Node.js process from exiting (the default)
- `unref()`: Allows the Node.js process to exit even if this timer is still pending
- `[Symbol.dispose]()`: Cancels the task. Enables `using` declarations for automatic cancellation when the handle goes out of scope.

### later.soon([callbackFunction])

Shorthand for `later(0, callbackFunction)`. Schedules a task to execute on the next event loop iteration using `setImmediate`.

#### Parameters

- `callbackFunction` (Function, optional): Function to execute on the next event loop iteration

#### Returns

Same as `later()`.

### later.asap([callbackFunction])

Shorthand for `later(-1, callbackFunction)`. Schedules a task to execute as soon as possible after the current event loop iteration.

#### Parameters

- `callbackFunction` (Function, optional): Function to execute as soon as possible

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
        .catch(() => {
            // Note: The promise returned from _later will never reject.
            // This catch function is unnecessary and will never execute.
        });

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
    // Cancel a callback function
    const task = _later(5000, () => {
        console.log('This will not execute');
    });

    console.log(`Task canceled? ${task.canceled}`); // false
    console.log(`Task completed? ${task.completed}`); // false

    // Cancel after 1 second
    _later(1000, () => {
        task.cancel();
        console.log(`Task canceled? ${task.canceled}`); // true
        console.log(`Task completed? ${task.completed}`); // false
    });
}

{
    // Cancel a promise
    const promise = _later(5000);

    promise.then(() => {
        console.log('This will not execute if canceled');
    }, error => {
        console.log(`The promise rejects with a ${error.name}`); // "The promise rejects with a CanceledError"
    });

    _later(1000, () => {
        promise.cancel();
    });
}

{
    // Cancel a promise silently
    const promise = _later(5000);

    promise.then(() => {
        console.log('This will not execute if canceled');
    });

    _later(1000, () => {
        promise.cancel({
            silent: true
        });
        // The promise will never settle; it neither resolves nor rejects
    });
}
```

### Cancellation with an AbortSignal

```javascript
import _later from 'isotropic-later';

{
    // Pass an AbortSignal to cancel() to tie the task's lifetime to a signal.
    const abortController = new AbortController(),
        promise = _later(5000).cancel({
            signal: abortController.signal
        });

    promise.then(() => {
        console.log('5 seconds elapsed without being aborted');
    });

    // Aborting cancels the timer. The promise is left unsettled (never rejects).
    someOtherWork().then(() => {
        abortController.abort();
    });
}

{
    // A single signal can cancel several tasks at once, and a single task can
    // be canceled by any of several signals.
    const abortController = new AbortController();

    _later(1000, () => console.log('one')).cancel({
        signal: abortController.signal
    });
    _later(2000, () => console.log('two')).cancel({
        signal: abortController.signal
    });

    // Later, abort to cancel both pending tasks.
    abortController.abort();
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

        await _later(1000);
        console.log('After 1 second');

        await _later(2000);
        console.log('After 3 seconds total');

        await _later(3000);
        console.log('After 6 seconds total');
    };

    sequentialDelays();
}
```

### Automatic Cancellation with `using`

```javascript
import _later from 'isotropic-later';

const _fetchUserProfile = async userId => {
    using slowWarning = _later(2000, () => {
        logger.warn(`Profile fetch for ${userId} is running slow`);
    });

    const user = await db.getUser(userId);

    if (!user) {
        return null; // slowWarning canceled automatically here
    }

    return {
        ...user,
        posts: await db.getPosts(userId)
    }; // slowWarning canceled automatically here too
};
```

## Contributing

Please refer to [CONTRIBUTING.md](https://github.com/ibi-group/isotropic-later/blob/main/CONTRIBUTING.md) for contribution guidelines.

## Issues

If you encounter any issues, please file them at https://github.com/ibi-group/isotropic-later/issues
