import PayloadParser from '../src/payload-parser';
import { assert } from 'chai';
import { fragmentizeTwoSeparators, fragmentizeTwoEqualSeparators } from './hexler-helper';

describe('stream-payload', () => {

  it('find', (done) => {
    fragmentizeTwoSeparators().forEach((hexle) => {
      hexle.hexle.forEach(fragments => {
        const sp = new PayloadParser('__BEGIN--', '_-END-_');
        let foundIdx = 0;
        fragments.forEach(fragment => {
          sp.feed(fragment, 0, (payload) => assert.equal(hexle.payload[foundIdx++], payload, fragment));
        });
        assert.equal(hexle.payload.length, foundIdx, fragments.toString());
      });
    });
    done();
  });

  it('find with equal begin and end haystack', (done) => {
    fragmentizeTwoEqualSeparators().forEach((hexle) => {
      hexle.hexle.forEach(fragments => {
        const sp = new PayloadParser('__SEP__', '__SEP__');
        let foundIdx = 0;
        fragments.forEach(fragment => {
          sp.feed(fragment, 0, (payload) => assert.equal(hexle.payload[foundIdx++], payload, fragment));
        });
        assert.equal(hexle.payload.length, foundIdx);
      });
    });
    done();
  });

});
