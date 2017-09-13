import StreamScanner from './stream-scanner';

export interface Step {
    pos: number;
    step: State;
}

export interface StringPos {
    start?: number;
    end?: number;
    str: string;
}

export class FragBuffer {
    public frags: StringPos[] = null;
    public match: string;
    constructor(match: string) {
        this.match = match;
    }
    public toString(): string {
        const ret = this.frags.map((sp: StringPos) => {
            if (sp.end === undefined) {
                return sp.str.substr(sp.start);
            }
            return sp.str.substring(sp.start, sp.end);
        }).join('');
        return ret.substr(0, (ret.length - this.match.length) + 1);
    }
}

export abstract class State {
    public next: State;
    public match: string;

    constructor(match: string) {
        this.match = match;
    }

    public abstract feed(fragment: string, pos: number): Step;

    public action(cb: () => void): State {
        return this;
    }
}

abstract class Scanner extends State {

    private streamScanner: StreamScanner;
    protected fragBuffer: FragBuffer;

    constructor(match: string, fb: FragBuffer) {
        super(match);
        this.streamScanner = new StreamScanner(match);
        this.fragBuffer = fb;
    }

    protected _feed(fragment: string, ofs: number, cb: (ofs: number) => void): Step {
        let next: Step = null;
        while (ofs < fragment.length) {
            const ret = this.streamScanner.findNext(fragment, ofs,
                (_fragment: string, pos: number) => {
                    cb(ofs);
                    next = { pos: pos, step: this.next };
                });
            if (next) {
                return next;
            }
            ofs = ret.pos;
        }
        return { pos: fragment.length, step: this };
    }
}

class FirstScanner extends Scanner {
    public feed(fragment: string, ofs: number): Step {
        return super._feed(fragment, ofs, (_ofs: number) => {
            this.fragBuffer.frags = [];
        });
    }
}

class LastScanner extends Scanner {
    public feed(fragment: string, ofs: number): Step {
        const sPos: StringPos = { start: ofs, str: fragment };
        this.fragBuffer.frags.push(sPos);
        return super._feed(fragment, ofs, (_ofs: number) => {
            sPos.end = _ofs;
        });
    }
}

class FoundScanner extends State {
    constructor() {
        super('FoundScanner');
    }
    public feed(fragment: string, ofs: number): Step {
        return null;
    }
    public action(cb: () => void): State {
        cb();
        return this.next;
    }
}

class PayloadParser {
    private graph: State;
    public first: string;
    public last: string;
    public fragBuffer: FragBuffer;

    private static buildStateGraph(first: string, last: string, fragBuffer: FragBuffer): State {
        const graph = new FirstScanner(first, fragBuffer);
        let _first: State = graph;
        const _last = new LastScanner(last, fragBuffer);
        _first.next = _last;
        const foundScanner = new FoundScanner();
        _last.next = foundScanner;
        foundScanner.next = graph;
        return graph;
    }

    constructor(first: string, last: string) {
        this.first = first;
        this.last = last;
        this.fragBuffer = new FragBuffer(last);
        this.graph = PayloadParser.buildStateGraph(first, last, this.fragBuffer);
    }

    public write(data: string): string {
        return `${this.first}${data}${this.last}`;
    }

    public feed(fragment: string, ofs: number, cb: (payload: string) => void): void {
        while (ofs < fragment.length) {
            const next = this.graph.feed(fragment, ofs);
            this.graph = next.step.action(() => {
                cb(this.fragBuffer.toString());
            });
            ofs = next.pos;
        }
    }

}

export default PayloadParser;
