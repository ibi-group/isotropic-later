import _chai from 'chai';
import _later from '../js/later.js';
import _mocha from 'mocha';
import _timers from 'timers';

_mocha.describe('later', function () {
    this.timeout(144);

    _mocha.it('should be a function', () => {
        _chai.expect(_later).to.be.a('function');
    });

    _mocha.it('should execute a task after a specified amount of time', callbackFunction => {
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

    _mocha.it('should allow tasks to be cancelled before execution', callbackFunction => {
        let called = false;

        const handle = _later(55, () => {
            called = true;
        });

        _chai.expect(handle).to.be.an('object');
        _chai.expect(handle).to.have.property('cancel').that.is.a('function');
        _chai.expect(handle).to.have.property('cancelled', false);

        _timers.setTimeout(() => {
            handle.cancel();
            _chai.expect(handle).to.have.property('cancelled', true);
        }, 34);

        _timers.setTimeout(() => {
            _chai.expect(called).to.be.false;
            callbackFunction();
        }, 89);
    });

    _mocha.it('should allow cancel to be called multiple times with no effect', callbackFunction => {
        let called = false;

        const handle = _later(55, () => {
            called = true;
        });

        _chai.expect(handle).to.be.an('object');
        _chai.expect(handle).to.have.property('cancel').that.is.a('function');
        _chai.expect(handle).to.have.property('cancelled', false);

        _timers.setTimeout(() => {
            handle.cancel().cancel().cancel();
            _chai.expect(handle).to.have.property('cancelled', true);
        }, 34);

        _timers.setTimeout(() => {
            _chai.expect(called).to.be.false;
            callbackFunction();
        }, 89);
    });

    _mocha.it('should allow a milliseconds value of 0', callbackFunction => {
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

    _mocha.it('should allow a milliseconds value less than 0', callbackFunction => {
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

    _mocha.it('should return a promise when there isn\'t a callback function', callbackFunction => {
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
});

_mocha.describe('#asap', function () {
    this.timeout(144);

    _mocha.it('should be a function', () => {
        _chai.expect(_later).to.have.property('asap').that.is.a('function');
    });

    _mocha.it('should execute a task as soon as possible but not before it returns', callbackFunction => {
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

    _mocha.it('should allow tasks to be cancelled before execution', callbackFunction => {
        let called = false;

        const handle = _later.asap(() => {
            called = true;
        });

        _chai.expect(handle).to.be.an('object');
        _chai.expect(handle).to.have.property('cancel').that.is.a('function');
        _chai.expect(handle).to.have.property('cancelled', false);
        handle.cancel();
        _chai.expect(handle).to.have.property('cancelled', true);

        _timers.setTimeout(() => {
            _chai.expect(called).to.be.false;
            callbackFunction();
        }, 8);
    });
});

_mocha.describe('#soon', function () {
    this.timeout(144);

    _mocha.it('should be a function', () => {
        _chai.expect(_later).to.have.property('asap').that.is.a('function');
    });

    _mocha.it('should execute a task soon but not before it returns', callbackFunction => {
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

    _mocha.it('should allow tasks to be cancelled before execution', callbackFunction => {
        let called = false;

        const handle = _later.soon(() => {
            called = true;
        });

        _chai.expect(handle).to.be.an('object');
        _chai.expect(handle).to.have.property('cancel').that.is.a('function');
        _chai.expect(handle).to.have.property('cancelled', false);
        handle.cancel();
        _chai.expect(handle).to.have.property('cancelled', true);

        _timers.setTimeout(() => {
            _chai.expect(called).to.be.false;
            callbackFunction();
        }, 8);
    });
});
