
export interface Step {
    pos: number;
    step: State;
}

export abstract class State {
    public next: State;
    public match: string;

    constructor(match: string) {
        this.match = match;
    }

    public abstract scan(fragment: string, pos: number): Step;

    public action(cb: () => void): State {
        return this;
    }
}

class FirstScanner extends State {

    constructor(match: string) {
        super(match);
    }

    public scan(fragment: string, ofs: number): Step {
        const pos = fragment.indexOf(this.match, ofs);

        if (pos >= 0) {
            return { pos: pos + 1, step: this.next };
        }

        return { pos: fragment.length, step: this };
    }
}

class NextScanner extends State {

    public reset: State;

    constructor(match: string, reset: State) {
        super(match);
        this.reset = reset;
    }

    public scan(fragment: string, ofs: number): Step {

        if (fragment.substr(ofs, 1) === this.match) {
            return { pos: ofs + 1, step: this.next };
        }

        return this.reset.scan(fragment, ofs);
    }
}

class FoundScanner extends State {

    constructor(next: State) {
        super('FoundScanner');
        this.next = next;
    }

    public scan(fragment: string, ofs: number): Step {
        return null;
    }

    public action(cb: () => void): State {
        cb();
        return this.next;
    }
}

export class StreamScanner {

    private graph: State;
    public hayStack: string;

    private static buildStateGraph(hayStack: string): State {

        const sarray = hayStack.split('');
        const graph = new FirstScanner(sarray.length ? sarray[0] : '');
        let current: State = graph;

        for (let idx = 1; idx < sarray.length; ++idx) {
            const tmp = new NextScanner(sarray[idx], graph);
            current.next = tmp;
            current = tmp;
        }

        current.next = new FoundScanner(graph);
        return graph;
    }

    constructor(hayStack: string) {
        this.graph = StreamScanner.buildStateGraph(hayStack);
        this.hayStack = hayStack;
    }

    public feed(fragment: string, ofs: number,
        cb: (fragment: string, ofs: number) => void,
        final_ly: (fragment: string, ofs: number) => void): void {
        let tail = 0;
        while (ofs < fragment.length) {
            const ret = this.findNext(fragment, ofs, (_frag, _ofs) => {
                tail = _ofs;
                cb(_frag, _ofs);
            });
            ofs = ret.pos;
        }
        final_ly(fragment, tail);
    }

    public findNext(fragment: string, ofs: number, cb: (fragment: string, ofs: number) => void): Step {
        const ret = this.graph.scan(fragment, ofs);
        // console.log('ret:', ret);
        this.graph = ret.step.action(() => {
            cb(fragment, ret.pos);
        });
        return ret;
    }

}

export default StreamScanner;
