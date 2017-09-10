import _asap from 'asap/raw.js';
import _timers from 'timers';

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

    return {
        cancel () {
            if (!cancelled) {
                cancelled = true;

                if (clearTimer) {
                    clearTimer();
                    clearTimer = void null;
                }
            }

            return this;
        },
        get cancelled () {
            return cancelled;
        },
        get completed () {
            return completed;
        }
    };
};

_later.asap = callbackFunction => _later(-1, callbackFunction);
_later.soon = callbackFunction => _later(0, callbackFunction);

export default _later;
