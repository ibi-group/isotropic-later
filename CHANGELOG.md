# isotropic-later Changelog

## 0.15.1 - 2026-08-23

### Changed

- Recommends `node ^26.7.0` / `npm ^11.19.0`.
- `repository` now uses npm's preferred object form with explicit `type` and `url` properties rather than the `github:` shorthand. This is package metadata only.

No runtime behavior changed in this release.

## 0.15.0 - 2026-07-15

### Breaking changes

**The `cancelled` property was renamed to `canceled`.** The returned timer object now exposes `canceled` (one `l`), matching the spelling used across the rest of the Isotropic family and by the new `isotropic-cancel` dependency.

```javascript
// Before
if (timer.cancelled) { /* ... */ }

// After
if (timer.canceled) { /* ... */ }
```

**Canceling the promise form now rejects the promise.** When called without a callback, `later` returns a promise. Canceling it previously left that promise pending forever. It now rejects with an `isotropic-error` whose `name` is `'CanceledError'` and whose message is `'Later canceled'`.

```javascript
const _timer = _later(1000);

_timer.cancel();

// Before: _timer never settles.
// After:  _timer rejects with a CanceledError.
```

This is almost always what you want, but if you cancel promise-form timers and never attached a rejection handler, you will now get unhandled rejection warnings or a process exit, depending on your `--unhandled-rejections` setting. Audit any `later(ms)` call whose result you cancel. To cancel without a rejection, pass `silent`:

```javascript
_timer.cancel({
    silent: true
});
```

**`cancel` now accepts a configuration object.** The signature is `cancel({ reason, signal, silent })`, delegated to `isotropic-cancel`. Existing no-argument `cancel()` calls continue to work and produce the default `CanceledError`.

**`completed` is now false after cancellation.** It reports `completed && !canceled`, so a canceled timer reports `completed === false`. Previously `completed` only ever became true when the callback actually ran, so behavior is unchanged in practice. The definition is now explicit.

**`isotropic-cancel` and `isotropic-error` are new runtime dependencies.** The package went from zero runtime dependencies in 0.14.0 back to two.

#### Migration

1. Rename every `.cancelled` read to `.canceled`.
2. For each promise-form timer you cancel, either attach a `.catch`, or pass `{ silent: true }` to `cancel`.
3. Nothing else changes. `later(ms, callback)`, `later.asap`, and `later.soon` behave as before.

### Added

**`Temporal.Duration` is accepted as the delay argument.** `later(Temporal.Duration.from({ seconds: 30 }), callback)` works. The duration is converted with `total('milliseconds')`. Plain numbers continue to work.

**`Symbol.dispose` support.** Timers can be scoped with a `using` declaration, canceling automatically at scope exit with a `DisposedError`:

```javascript
{
    using _timer = _later(1000, () => {
        // ...
    });

    // _timer is canceled when this block exits.
}
```

### Changed

- `description` rewritten and `keywords` expanded.
- Recommends `node ^26.5.0` / `npm ^11.17.0`.

### Internal

- Cancellation state is now managed by an `isotropic-cancel` instance rather than local booleans.
- Test suite migrated from Mocha to the built-in `node --test` runner.
- The Babel toolchain and build scripts were removed.
- Source moved from `js/` to `lib/`.
- `isotropic-dev-dependencies` updated to `~0.4.0`.

## 0.14.0 - 2025-06-18

### Breaking changes

**The `asap` runtime dependency was removed.** Sub-zero-delay scheduling now uses the built-in `queueMicrotask` instead of `asap/raw.js`. This makes the package dependency-free.

`later.asap(callback)` and `later(-1, callback)` still schedule the callback ahead of timers and immediates, but the scheduling primitive changed. `asap/raw` used a mutation observer or `setImmediate`-based trampoline that batched callbacks into a single drain. `queueMicrotask` enqueues directly onto the microtask queue. Relative ordering against promise continuations can differ, since `queueMicrotask` callbacks interleave with promise jobs in the same queue rather than being drained as a separate batch.

If you depend on precise interleaving between `later.asap` callbacks and promise `.then` handlers, retest that ordering.

## 0.13.1 - 2025-04-10

### Changed

- A comprehensive README was added.
- `eslint` pinned at `~9.8.0` as a direct dev dependency.
- `isotropic-dev-dependencies` bumped to `~0.3.1`.

No runtime behavior changed in this release.

## 0.13.0 - 2024-07-30

### Added

**`hasRef`, `ref`, and `unref` on the returned timer object.** These delegate to the underlying Node.js `Timeout` or `Immediate`, so a pending `later` timer can be prevented from holding the event loop open:

```javascript
const _timer = _later(60000, () => {
    // ...
});

_timer.unref(); // The process may now exit before this fires.
```

`hasRef()` returns `false` once the timer has been canceled or has completed. For the microtask path (`later.asap`, or a negative delay) there is no underlying timer object, so `ref` and `unref` are no-ops and `hasRef()` reports `true` while pending.

### Breaking changes

**The package is now an ES module.** `"type": "module"` was added to `package.json`. CommonJS consumers can no longer `require('isotropic-later')`.

#### Migration

Switch to `import`:

```javascript
// Before
const _later = require('isotropic-later');

// After
import _later from 'isotropic-later';
```

### Changed

- The cancel path stores the timer handle and the matching clear function directly rather than allocating a closure per call.
- `node:timers` is now imported with the `node:` prefix.
- ESLint moved to flat config.
- Coverage tooling switched from `nyc` to `c8`.
- `repository` given an explicit `github:` prefix.
- Recommends `node ^22.5.1` / `npm ^10.8.2`.

## 0.12.0 - 2021-02-22

### Changed

- The entire dev toolchain was replaced by a single `isotropic-dev-dependencies` dev dependency.
- Recommends `node ^14.15.5` / `npm ^7.5.4`.

No runtime behavior changed in this release.

## 0.11.0 - 2020-07-27

### Added

**A promise is returned when no callback function is supplied.** `later(1000)` now returns a promise that resolves after the delay, while still carrying the `cancel` method and the `cancelled` and `completed` accessors:

```javascript
await _later(1000);
```

When a callback *is* supplied the return value remains a plain object, exactly as before.

### Breaking changes

**The returned object's properties are now defined via `Object.defineProperties`** rather than an object literal. They are configurable and enumerable, and `cancelled` and `completed` remain accessors. Behavior for normal use is unchanged, but code that inspected the object's shape, for example expecting `cancel` to be a plain own data property on an object literal, may observe differences.

### Changed

- A `files` allowlist was added so only `lib` is published.
- `.npmignore` was removed.
- Recommends `node ^12.18.3` / `npm ^6.14.6`.

## 0.10.0 - 2019-05-10

### Changed

- Added the `isotropic` keyword to `package.json`.
- Dependency bumps.

No runtime behavior changed in this release.

## 0.9.2 - 2019-05-08

### Changed

Dependency bumps only.

## 0.9.1 - 2019-05-08

### Changed

Dependency bumps only.

## 0.9.0 - 2019-05-08

### Changed

- Dev dependency refresh (Babel 7.4, Mocha 6, nyc 14, ESLint 5.16).
- Recommends `node ^10.15.3` / `npm ^6.4.1`.

No runtime behavior changed in this release.

## 0.8.0 - 2019-02-18

### Changed

- Dev dependency refresh.
- Recommends `node ^10.15.1` / `npm ^6.4.1`.

No runtime behavior changed in this release.

## 0.7.0 - 2018-11-25

### Changed

- Migrated from Babel 6 to Babel 7, and from `babel-istanbul` to `nyc` for coverage.
- Dropped the `nsp` security check.
- Recommends `node ^10.13.0` / `npm ^6.4.1`.

No runtime behavior changed in this release.

## 0.6.0 - 2017-09-12

### Added

**`later.asap` and `later.soon` convenience methods.** `later.asap(callback)` schedules on the microtask queue. `later.soon(callback)` schedules with `setImmediate`. Both return the same cancelable object as `later` itself.

### Breaking changes

**Zero and negative delays now behave differently from each other.** Previously any delay `<= 0` was routed to `isotropic-asap`. Now a negative delay uses the ASAP path, a delay of exactly `0` uses `setImmediate`, and a positive delay uses `setTimeout`.

If you called `later(0, callback)` expecting microtask-timing execution, it now runs on the immediate/check phase instead, which is later than before, after I/O callbacks. Use `later(-1, callback)` or `later.asap(callback)` for the old behavior.

**A canceled timer's callback is now reliably suppressed.** The scheduled function checks the cancelled flag before invoking the callback, so cancellation is honored even when the underlying timer cannot be cleared. This is notable on the ASAP path, which previously had no way to cancel at all.

**The `isotropic-asap` dependency was replaced with `asap`.** The upstream `asap/raw.js` entry point is used directly.

**The `babel-runtime` runtime dependency was removed.**

### Changed

- Recommends `node ^8.4.0` / `npm ^5.4.1`.

## 0.5.0 - 2017-02-05

### Changed

- Dependency bumps.
- Recommends `node ^6.9.5` / `npm ^4.1.2`.

No runtime behavior changed in this release.

## 0.4.0 - 2017-01-08

### Changed

- Dependency bumps.
- Recommends `node ^6.9.4` / `npm ^4.1.1`.

No runtime behavior changed in this release.

## 0.3.0 - 2016-11-27

### Changed

- The deprecated `prepublish` script was replaced by `prepare` and `prepublishOnly`.
- Lint target raised to ECMAScript 2017.
- Recommends `node ^6.9.1` / `npm ^4.0.2`.

No runtime behavior changed in this release.

## 0.2.0 - 2016-07-14

### Changed

- `babel-runtime` bumped to `~6.9.1`.
- `isotropic-asap` bumped to `~0.2.0`.

No runtime behavior changed in this release.

## 0.1.0 - 2016-05-02

Initial release.

- Default export is a function `(milliseconds, callbackFunction)` that schedules a callback and returns a cancelable handle.
- A delay of `0` or less defers to `isotropic-asap` and returns whatever that returns. A positive delay uses `setTimeout`.
- The returned object exposes `cancel()`, which clears the timer and is idempotent, plus `cancelled` and `completed` accessors.
- Depends on `isotropic-asap` and `babel-runtime`.
