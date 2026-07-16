import _chai from 'isotropic-dev-dependencies/lib/chai.js';
import _Error from 'isotropic-error';
import _later from '../lib/later.js';
import _test from 'node:test';
import _timers from 'node:timers';

_test.describe('later', () => {
    _test.it('should be a function', () => {
        _chai.expect(_later).to.be.a('function');
    });

    _test.it('should execute a task after a specified amount of time', {
        timeout: 144
    }, (test, callbackFunction) => {
        let before = true,
            complete = false,
            first = false;

        const handle = _later(55, () => {
            complete = true;

            _chai.expect(before).to.be.false;
            _chai.expect(first).to.be.true;
            _chai.expect(handle).to.have.property('completed', true);
        });

        _chai.expect(handle).to.be.an('object');
        _chai.expect(handle).to.have.property('completed', false);

        _timers.setTimeout(() => {
            first = true;

            _chai.expect(before).to.be.false;
            _chai.expect(complete).to.be.false;
        }, 34);

        _timers.setTimeout(() => {
            _chai.expect(before).to.be.false;
            _chai.expect(complete).to.be.true;
            _chai.expect(first).to.be.true;

            callbackFunction();
        }, 89);

        before = false;
    });

    _test.it('should accept a Temporal.Duration', {
        timeout: 144
    }, (test, callbackFunction) => {
        let complete = false;

        const handle = _later(Temporal.Duration.from({
            milliseconds: 34
        }), () => {
            complete = true;
        });

        _chai.expect(handle).to.have.property('completed', false);

        _timers.setTimeout(() => {
            _chai.expect(complete).to.be.true;
            _chai.expect(handle).to.have.property('completed', true);

            callbackFunction();
        }, 55);
    });

    _test.it('should allow tasks to be canceled before execution', {
        timeout: 144
    }, (test, callbackFunction) => {
        let called = false;

        const handle = _later(55, () => {
            called = true;
        });

        _chai.expect(handle).to.be.an('object');
        _chai.expect(handle).to.have.property('cancel').that.is.a('function');
        _chai.expect(handle).to.have.property('canceled', false);

        _timers.setTimeout(() => {
            handle.cancel();
            _chai.expect(handle).to.have.property('canceled', true);
        }, 34);

        _timers.setTimeout(() => {
            _chai.expect(called).to.be.false;
            callbackFunction();
        }, 89);
    });

    _test.it('should allow cancel to be called multiple times with no effect', {
        timeout: 144
    }, (test, callbackFunction) => {
        let called = false;

        const handle = _later(55, () => {
            called = true;
        });

        _chai.expect(handle).to.be.an('object');
        _chai.expect(handle).to.have.property('cancel').that.is.a('function');
        _chai.expect(handle).to.have.property('canceled', false);

        _timers.setTimeout(() => {
            handle.cancel().cancel().cancel();
            _chai.expect(handle).to.have.property('canceled', true);
        }, 34);

        _timers.setTimeout(() => {
            _chai.expect(called).to.be.false;
            callbackFunction();
        }, 89);
    });

    _test.it('should respond to hasRef, ref, and unref', () => {
        const handle = _later(55, () => {
            // empty function
        });

        _chai.expect(handle).to.be.an('object');
        _chai.expect(handle).to.have.property('hasRef').that.is.a('function');
        _chai.expect(handle).to.have.property('ref').that.is.a('function');
        _chai.expect(handle).to.have.property('unref').that.is.a('function');
        _chai.expect(handle.hasRef()).to.be.true;
        handle.unref();
        _chai.expect(handle.hasRef()).to.be.false;
        handle.ref();
        _chai.expect(handle.hasRef()).to.be.true;
    });

    _test.it('should respond false to hasRef after canceled', () => {
        const handle = _later(55, () => {
            // empty function
        });

        handle.cancel();
        _chai.expect(handle.hasRef()).to.be.false;
    });

    _test.it('should respond false to hasRef after completed', {
        timeout: 144
    }, (test, callbackFunction) => {
        const handle = _later(55, () => {
            _chai.expect(handle.hasRef()).to.be.false;
            callbackFunction();
        });
    });

    _test.it('should allow a milliseconds value of 0', {
        timeout: 144
    }, (test, callbackFunction) => {
        let before = true;

        const handle = _later(0, () => {
            _chai.expect(before).to.be.false;
            _chai.expect(handle).to.have.property('completed', true);
            callbackFunction();
        });

        _chai.expect(handle).to.be.an('object');
        _chai.expect(handle).to.have.property('completed', false);

        before = false;
    });

    _test.it('should allow a milliseconds value less than 0', {
        timeout: 144
    }, (test, callbackFunction) => {
        let before = true;

        const handle = _later(-123, () => {
            _chai.expect(before).to.be.false;
            _chai.expect(handle).to.have.property('completed', true);
            callbackFunction();
        });

        _chai.expect(handle).to.be.an('object');
        _chai.expect(handle).to.have.property('completed', false);

        before = false;
    });

    _test.it('should return a promise when there isn\'t a callback function', {
        timeout: 144
    }, (test, callbackFunction) => {
        let before = true,
            complete = false,
            first = false;

        const handle = _later(55);

        _chai.expect(handle).to.be.a('promise');
        _chai.expect(handle).to.have.property('completed', false);

        handle.then(() => {
            complete = true;

            _chai.expect(before).to.be.false;
            _chai.expect(first).to.be.true;
            _chai.expect(handle).to.have.property('completed', true);
        });

        _timers.setTimeout(() => {
            first = true;

            _chai.expect(before).to.be.false;
            _chai.expect(complete).to.be.false;
        }, 34);

        _timers.setTimeout(() => {
            _chai.expect(before).to.be.false;
            _chai.expect(complete).to.be.true;
            _chai.expect(first).to.be.true;

            callbackFunction();
        }, 89);

        before = false;
    });

    _test.it('should expose cancel, canceled, ref, unref, and hasRef on the returned promise', () => {
        const handle = _later(55);

        _chai.expect(handle).to.be.a('promise');
        _chai.expect(handle).to.have.property('cancel').that.is.a('function');
        _chai.expect(handle).to.have.property('canceled', false);
        _chai.expect(handle).to.have.property('hasRef').that.is.a('function');
        _chai.expect(handle).to.have.property('ref').that.is.a('function');
        _chai.expect(handle).to.have.property('unref').that.is.a('function');
        _chai.expect(handle.hasRef()).to.be.true;
        handle.unref();
        _chai.expect(handle.hasRef()).to.be.false;
        handle.ref();
        _chai.expect(handle.hasRef()).to.be.true;
    });

    _test.it('should reject the returned promise when canceled', {
        timeout: 144
    }, (test, callbackFunction) => {
        let rejected = false,
            resolved = false;

        const handle = _later(34);

        handle.then(() => {
            resolved = true;
        }, error => {
            _chai.expect(error).to.be.an.instanceof(_Error);
            _chai.expect(error).to.have.property('name', 'CanceledError');
            rejected = true;
        });

        _chai.expect(handle.cancel()).to.equal(handle);
        _chai.expect(handle).to.have.property('canceled', true);

        _timers.setTimeout(() => {
            _chai.expect(rejected).to.be.true;
            _chai.expect(resolved).to.be.false;
            callbackFunction();
        }, 89);
    });

    _test.it('should not reject the returned promise when canceled silently', {
        timeout: 144
    }, (test, callbackFunction) => {
        let rejected = false,
            resolved = false;

        const handle = _later(34);

        handle.then(() => {
            resolved = true;
        }, () => {
            rejected = true;
        });

        _chai.expect(handle.cancel({
            silent: true
        })).to.equal(handle);
        _chai.expect(handle).to.have.property('canceled', true);

        _timers.setTimeout(() => {
            _chai.expect(rejected).to.be.false;
            _chai.expect(resolved).to.be.false;
            callbackFunction();
        }, 89);
    });

    _test.it('should cancel the task when disposed', {
        timeout: 144
    }, (test, callbackFunction) => {
        let called = false;

        {
            using handle = _later(34, () => {
                called = true;
            });

            _chai.expect(handle).to.have.property(Symbol.dispose).that.is.a('function');
        }

        _timers.setTimeout(() => {
            _chai.expect(called).to.be.false;
            callbackFunction();
        }, 89);
    });

    _test.it('should reject the returned promise when disposed', {
        timeout: 144
    }, (test, callbackFunction) => {
        let rejected = false,
            resolved = false;

        {
            using handle = _later(34);

            _chai.expect(handle).to.have.property(Symbol.dispose).that.is.a('function');

            handle.then(() => {
                resolved = true;
            }, error => {
                _chai.expect(error).to.be.an.instanceof(_Error);
                _chai.expect(error).to.have.property('name', 'DisposedError');
                rejected = true;
            });
        }

        _timers.setTimeout(() => {
            _chai.expect(rejected).to.be.true;
            _chai.expect(resolved).to.be.false;
            callbackFunction();
        }, 89);
    });

    _test.it('should cancel when a signal passed to cancel aborts', {
        timeout: 144
    }, (test, callbackFunction) => {
        let called = false;

        const abortController = new AbortController(),
            handle = _later(55, () => {
                called = true;
            });

        _chai.expect(handle.cancel({
            signal: abortController.signal
        })).to.equal(handle);
        _chai.expect(handle).to.have.property('canceled', false);

        _timers.setTimeout(() => {
            abortController.abort();
            _chai.expect(handle).to.have.property('canceled', true);
        }, 21);

        _timers.setTimeout(() => {
            _chai.expect(called).to.be.false;
            callbackFunction();
        }, 89);
    });

    _test.it('should cancel immediately when the signal is already aborted', () => {
        let called = false;

        const abortController = new AbortController(),
            handle = _later(55, () => {
                called = true;
            });

        abortController.abort();
        handle.cancel({
            signal: abortController.signal
        });

        _chai.expect(handle).to.have.property('canceled', true);
        _chai.expect(handle.hasRef()).to.be.false;
        _chai.expect(called).to.be.false;
    });

    _test.it('should reject the promise when canceled via a signal', {
        timeout: 144
    }, (test, callbackFunction) => {
        let rejected = false,
            resolved = false;

        const abortController = new AbortController(),
            handle = _later(34).cancel({
                signal: abortController.signal
            });

        handle.then(() => {
            resolved = true;
        }, error => {
            _chai.expect(error).to.be.an.instanceof(_Error);
            _chai.expect(error).to.have.property('name', 'AbortError');
            rejected = true;
        });

        abortController.abort();

        _chai.expect(handle).to.have.property('canceled', true);

        _timers.setTimeout(() => {
            _chai.expect(rejected).to.be.true;
            _chai.expect(resolved).to.be.false;
            callbackFunction();
        }, 89);
    });

    _test.it('should not reject the promise when canceled silently via a signal', {
        timeout: 144
    }, (test, callbackFunction) => {
        let rejected = false,
            resolved = false;

        const abortController = new AbortController(),
            handle = _later(34).cancel({
                signal: abortController.signal,
                silent: true
            });

        handle.then(() => {
            resolved = true;
        }, () => {
            rejected = true;
        });

        abortController.abort();

        _chai.expect(handle).to.have.property('canceled', true);

        _timers.setTimeout(() => {
            _chai.expect(rejected).to.be.false;
            _chai.expect(resolved).to.be.false;
            callbackFunction();
        }, 89);
    });

    _test.it('should do nothing when a signal aborts after the timer was already canceled', {
        timeout: 144
    }, (test, callbackFunction) => {
        let called = false;

        const abortController = new AbortController(),
            handle = _later(55, () => {
                called = true;
            });

        handle.cancel({
            signal: abortController.signal
        });
        handle.cancel();

        _chai.expect(handle).to.have.property('canceled', true);

        abortController.abort();

        _chai.expect(handle).to.have.property('canceled', true);

        _timers.setTimeout(() => {
            _chai.expect(called).to.be.false;
            callbackFunction();
        }, 89);
    });

    _test.it('should cancel when any one of multiple signals aborts', {
        timeout: 144
    }, (test, callbackFunction) => {
        let called = false;

        const abortControllerA = new AbortController(),
            abortControllerB = new AbortController(),
            handle = _later(55, () => {
                called = true;
            });

        handle.cancel({
            signal: abortControllerA.signal
        });
        handle.cancel({
            signal: abortControllerB.signal
        });

        abortControllerB.abort();

        _chai.expect(handle).to.have.property('canceled', true);

        _timers.setTimeout(() => {
            _chai.expect(abortControllerA.signal.aborted).to.be.false;
            _chai.expect(abortControllerB.signal.aborted).to.be.true;
            _chai.expect(called).to.be.false;
            callbackFunction();
        }, 89);
    });

    _test.it('should ignore the same signal passed to cancel more than once', {
        timeout: 144
    }, (test, callbackFunction) => {
        let called = false;

        const abortController = new AbortController(),
            handle = _later(55, () => {
                called = true;
            });

        handle.cancel({
            signal: abortController.signal
        });
        handle.cancel({
            signal: abortController.signal
        });

        abortController.abort();

        _chai.expect(handle).to.have.property('canceled', true);

        _timers.setTimeout(() => {
            _chai.expect(called).to.be.false;
            callbackFunction();
        }, 89);
    });

    _test.it('should still complete normally when a signal is provided but never aborts', {
        timeout: 144
    }, (test, callbackFunction) => {
        const abortController = new AbortController(),
            handle = _later(34, () => {
                _chai.expect(abortController.signal.aborted).to.be.false;
                _chai.expect(handle).to.have.property('canceled', false);
                _chai.expect(handle).to.have.property('completed', true);
                callbackFunction();
            });

        handle.cancel({
            signal: abortController.signal
        });
    });

    _test.it('should not become canceled when cancel is called after the timer completed', {
        timeout: 144
    }, (test, callbackFunction) => {
        const handle = _later(34, () => {
            _chai.expect(handle).to.have.property('completed', true);

            handle.cancel();

            _chai.expect(handle).to.have.property('canceled', false);
            _chai.expect(handle).to.have.property('completed', true);
            callbackFunction();
        });
    });
});

_test.describe('#asap', {
    timeout: 144
}, () => {
    _test.it('should be a function', () => {
        _chai.expect(_later).to.have.property('asap').that.is.a('function');
    });

    _test.it('should execute a task as soon as possible but not before it returns', {
        timeout: 144
    }, (test, callbackFunction) => {
        let before = true;

        const handle = _later.asap(() => {
            _chai.expect(before).to.be.false;
            _chai.expect(handle).to.have.property('completed', true);
            callbackFunction();
        });

        _chai.expect(handle).to.be.an('object');
        _chai.expect(handle).to.have.property('completed', false);

        before = false;
    });

    _test.it('should allow tasks to be canceled before execution', {
        timeout: 144
    }, (test, callbackFunction) => {
        let called = false;

        const handle = _later.asap(() => {
            called = true;
        });

        _chai.expect(handle).to.be.an('object');
        _chai.expect(handle).to.have.property('cancel').that.is.a('function');
        _chai.expect(handle).to.have.property('canceled', false);
        handle.cancel();
        _chai.expect(handle).to.have.property('canceled', true);

        _timers.setTimeout(() => {
            _chai.expect(called).to.be.false;
            callbackFunction();
        }, 8);
    });

    _test.it('should respond true to hasRef', () => {
        const handle = _later.asap(() => {
            // empty function
        });

        _chai.expect(handle).to.be.an('object');
        _chai.expect(handle).to.have.property('hasRef').that.is.a('function');
        _chai.expect(handle.hasRef()).to.be.true;
    });
});

_test.describe('#soon', {
    timeout: 144
}, () => {
    _test.it('should be a function', () => {
        _chai.expect(_later).to.have.property('soon').that.is.a('function');
    });

    _test.it('should execute a task soon but not before it returns', {
        timeout: 144
    }, (test, callbackFunction) => {
        let before = true;

        const handle = _later.soon(() => {
            _chai.expect(before).to.be.false;
            _chai.expect(handle).to.have.property('completed', true);
            callbackFunction();
        });

        _chai.expect(handle).to.be.an('object');
        _chai.expect(handle).to.have.property('completed', false);

        before = false;
    });

    _test.it('should allow tasks to be canceled before execution', {
        timeout: 144
    }, (test, callbackFunction) => {
        let called = false;

        const handle = _later.soon(() => {
            called = true;
        });

        _chai.expect(handle).to.be.an('object');
        _chai.expect(handle).to.have.property('cancel').that.is.a('function');
        _chai.expect(handle).to.have.property('canceled', false);
        handle.cancel();
        _chai.expect(handle).to.have.property('canceled', true);

        _timers.setTimeout(() => {
            _chai.expect(called).to.be.false;
            callbackFunction();
        }, 8);
    });
});
