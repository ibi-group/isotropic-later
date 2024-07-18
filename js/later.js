import _asap from 'asap/raw.js';
import _timers from 'node:timers';

const _later = (milliseconds, callbackFunction) => {
    let cancelled = false,
        clearTimer,
        completed = false;

    const timerFunction = () => {
        if (!cancelled) {
            completed = true;
            callbackFunction();
        }
    };

    if (milliseconds < 0) {
        _asap(timerFunction);
    } else if (milliseconds === 0) {
        const timer = _timers.setImmediate(timerFunction);

        clearTimer = () => {
            _timers.clearImmediate(timer);
        };
    } else {
        const timer = _timers.setTimeout(timerFunction, milliseconds);

        clearTimer = () => {
            _timers.clearTimeout(timer);
        };
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

                        if (clearTimer) {
                            clearTimer();
                            clearTimer = void null;
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
            }
        }
    );
};

_later.asap = callbackFunction => _later(-1, callbackFunction);
_later.soon = callbackFunction => _later(0, callbackFunction);

export default _later;
