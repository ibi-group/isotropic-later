import {
    clearTimeout,
    setTimeout
} from 'timers';

import asap from 'isotropic-asap';

export default (milliseconds, callbackFunction) => {
    if (milliseconds <= 0) {
        return asap(callbackFunction);
    }

    let cancelled = false,
        completed = false;

    const timer = setTimeout(() => {
        completed = true;
        callbackFunction();
    }, milliseconds);

    return {
        cancel () {
            if (!cancelled) {
                cancelled = true;
                clearTimeout(timer);
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
