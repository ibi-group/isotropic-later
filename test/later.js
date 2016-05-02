import {
    describe,
    it
} from 'mocha';

import {
    expect
} from 'chai';

import later from '../js/later.js';

import {
    setTimeout
} from 'timers';

describe('later', function () {
    this.timeout(144);

    it('should be a function', () => {
        expect(later).to.be.a('function');
    });

    it('should execute a task after a specified amount of time', callbackFunction => {
        let before = true,
            complete = false,
            first = false;

        const handle = later(55, () => {
            complete = true;

            expect(before).to.be.false;
            expect(first).to.be.true;
            expect(handle).to.have.property('completed', true);
        });

        expect(handle).to.be.an('object');
        expect(handle).to.have.property('completed', false);

        setTimeout(() => {
            first = true;

            expect(before).to.be.false;
            expect(complete).to.be.false;
        }, 34);

        setTimeout(() => {
            expect(before).to.be.false;
            expect(complete).to.be.true;
            expect(first).to.be.true;

            callbackFunction();
        }, 89);

        before = false;
    });

    it('should allow tasks to be cancelled before execution', callbackFunction => {
        let called = false;

        const handle = later(55, () => {
            called = true;
        });

        expect(handle).to.be.an('object');
        expect(handle).to.have.property('cancel').that.is.a('function');
        expect(handle).to.have.property('cancelled', false);

        setTimeout(() => {
            handle.cancel();
            expect(handle).to.have.property('cancelled', true);
        }, 34);

        setTimeout(() => {
            expect(called).to.be.false;
            callbackFunction();
        }, 89);
    });

    it('should allow cancel to be called multiple times with no effect', callbackFunction => {
        let called = false;

        const handle = later(55, () => {
            called = true;
        });

        expect(handle).to.be.an('object');
        expect(handle).to.have.property('cancel').that.is.a('function');
        expect(handle).to.have.property('cancelled', false);

        setTimeout(() => {
            handle.cancel().cancel().cancel();
            expect(handle).to.have.property('cancelled', true);
        }, 34);

        setTimeout(() => {
            expect(called).to.be.false;
            callbackFunction();
        }, 89);
    });

    it('should should allow a time value of 0', callbackFunction => {
        let before = true;

        const handle = later(0, () => {
            expect(before).to.be.false;
            expect(handle).to.have.property('completed', true);
            callbackFunction();
        });

        expect(handle).to.be.an('object');
        expect(handle).to.have.property('completed', false);

        before = false;
    });
});
