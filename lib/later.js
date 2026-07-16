import _Cancel from 'isotropic-cancel';
import _Error from 'isotropic-error';
import _timers from 'node:timers';

const _later = (duration, callbackFunction) => {
    if (duration instanceof Temporal.Duration) {
        duration = duration.total('milliseconds');
    }

    let clearTimer,
        rejectFunction,
        timer;

    const cancel = _Cancel({
            onCancel: ({
                error
            }) => {
                if (clearTimer && timer) {
                    clearTimer(timer);
                    clearTimer = void null;
                    timer = void null;
                }

                if (rejectFunction && error) {
                    rejectFunction(error);
                }
            },
            subject: 'Later'
        }),
        timerFunction = () => {
            if (!cancel.canceled) {
                cancel.complete();
                callbackFunction();
            }
        };

    if (duration < 0) {
        queueMicrotask(timerFunction);
    } else if (duration === 0) {
        clearTimer = _timers.clearImmediate;
        timer = _timers.setImmediate(timerFunction);
    } else {
        clearTimer = _timers.clearTimeout;
        timer = _timers.setTimeout(timerFunction, duration);
    }

    return Object.defineProperties(
        typeof callbackFunction === 'function' ?
            {} :
            new Promise((resolve, reject) => {
                callbackFunction = resolve;
                rejectFunction = reject;
            }),
        {
            cancel: {
                configurable: true,
                enumerable: true,
                value (config) {
                    cancel.cancel(config);

                    return this;
                }
            },
            canceled: {
                configurable: true,
                enumerable: true,
                get () {
                    return cancel.canceled;
                }
            },
            completed: {
                configurable: true,
                enumerable: true,
                get () {
                    return cancel.completed && !cancel.canceled;
                }
            },
            hasRef: {
                configurable: true,
                enumerable: true,
                value () {
                    if (cancel.completed) {
                        return false;
                    }

                    return timer ?
                        timer.hasRef() :
                        true;
                }
            },
            ref: {
                configurable: true,
                enumerable: true,
                value () {
                    if (timer) {
                        timer.ref();
                    }

                    return this;
                }
            },
            unref: {
                configurable: true,
                enumerable: true,
                value () {
                    if (timer) {
                        timer.unref();
                    }

                    return this;
                }
            },
            [Symbol.dispose]: {
                configurable: true,
                enumerable: true,
                value () {
                    this.cancel({
                        reason: _Error({
                            message: 'Disposed',
                            name: 'DisposedError'
                        })
                    });
                }
            }
        }
    );
};

_later.asap = callbackFunction => _later(-1, callbackFunction);
_later.soon = callbackFunction => _later(0, callbackFunction);

export default _later;
