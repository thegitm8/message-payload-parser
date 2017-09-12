
import { Map } from 'es6-shim';

interface Hexle {
  findCount: number;
  payload: string[];
  hexle: string[][];
}
function hexler(ret: Map<string, Hexle>, count: number, payload: string[], hayStack: string): void {
  const hexle: Hexle = { findCount: count, payload: payload, hexle: [ [hayStack] ] };
  [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(fragLen => {
    const tmp: string[] = [];
    for (let i = 0; i < hayStack.length; i += fragLen) {
      tmp.push(hayStack.substr(i, fragLen));
    }
    hexle.hexle.push(tmp);
  });
  ret.set(hayStack, hexle);
}

export function fragmentizeOneSeparator(): Map<string, Hexle> {
  const ret = new Map<string, Hexle>();
  hexler(ret, 0, [], '');
  hexler(ret, 2, [], '__Juju--found____Juju--');
  hexler(ret, 0, [], '__Juju-+');
  hexler(ret, 1, [], 'm__Juju--found');
  hexler(ret, 0, [], 'm__Juju-+meno');
  hexler(ret, 2, [], 'meno__Juju--__Juju--found');
  hexler(ret, 0, [], 'meno__Juju-+meno');

  return ret;
}

export function fragmentizeTwoSeparators(): Map<string, Hexle> {
  const ret = new Map<string, Hexle>();

  hexler(ret, 0, [], 'meno__Juju-+meno');
  hexler(ret, 0, ['', ''], 'meno__BEGIN--_-END-_meno_-__BEGIN--_-END-_bla');
  hexler(ret, 0, [''], '__BEGIN--_-END-_');
  hexler(ret, 0, ['test'], '__BEGIN--test_-END-_');
  hexler(ret, 0, ['found', 'found2'], 'meno__BEGIN--found_-END-_meno_-__BEGIN--found2_-END-_bla');
  hexler(ret, 0, ['found'], 'meno__BEGIN--found_-END-_meno_-__BEGIN--found_-XEND-_bla');
  hexler(ret, 0, ['found'], 'meno__BEGIN--found_-END-__-END-__meno_-__BEGIN--found_-XEND-_bla');
  hexler(ret, 0, ['__BEGIN--found'], 'meno__BEGIN--__BEGIN--found_-END-_meno_-__BEGIN--found_-XEND-_bla');

  return ret;
}

export function fragmentizeTwoEqualSeparators(): Map<string, Hexle> {
  const ret = new Map<string, Hexle>();

  hexler(ret, 0, [], '__SEP__');
  hexler(ret, 0, [''], '__SEP____SEP__');
  hexler(ret, 0, ['test'], '__SEP__test__SEP__');
  hexler(ret, 0, ['test', 'test2'], '__SEP__test__SEP____SEP__test2__SEP__');
  hexler(ret, 0, ['test', 'test2'], 'xx__SEP__test__SEP____SEP__test2__SEP__xx');
  hexler(ret, 0, ['test'], 'xx__SEP__test__SEP__sadcds__SEP__test2xx');

  return ret;
}
