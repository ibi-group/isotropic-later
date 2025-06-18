import _timers from 'node:timers';

const _later = (milliseconds, callbackFunction) => {
    let cancelled = false,
        clearTimer,
        completed = false,
        timer;

    const timerFunction = () => {
        if (!cancelled) {
            completed = true;
            callbackFunction();
        }
    };

    if (milliseconds < 0) {
        queueMicrotask(timerFunction);
    } else if (milliseconds === 0) {
        clearTimer = _timers.clearImmediate;
        timer = _timers.setImmediate(timerFunction);
    } else {
        clearTimer = _timers.clearTimeout;
        timer = _timers.setTimeout(timerFunction, milliseconds);
    }

    return Object.defineProperties(
        typeof callbackFunction === 'function' ?
            {} :
            new Promise(resolve => {
                callbackFunction = resolve;
            }),
        {
            cancel: {
                configurable: true,
                enumerable: true,
                value () {
                    if (!cancelled) {
                        cancelled = true;

                        if (clearTimer && timer) {
                            clearTimer(timer);
                            clearTimer = void null;
                            timer = void null;
                        }
                    }

                    return this;
                }
            },
            cancelled: {
                configurable: true,
                enumerable: true,
                get () {
                    return cancelled;
                }
            },
            completed: {
                configurable: true,
                enumerable: true,
                get () {
                    return completed;
                }
            },
            hasRef: {
                configurable: true,
                enumerable: true,
                value () {
                    if (cancelled || completed) {
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
            }
        }
    );
};

_later.asap = callbackFunction => _later(-1, callbackFunction);
_later.soon = callbackFunction => _later(0, callbackFunction);

export default _later;
