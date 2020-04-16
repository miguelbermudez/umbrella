import type { IReader, ParseScope } from "./api";
import { parseError } from "./error";
import { defStringReader } from "./string-reader";

interface ContextOpts {
    /**
     * Max recursion depth failsafe.
     *
     * @defaultVal 32
     */
    maxDepth: number;
    /**
     * True to enable parser debug output.
     *
     * @defaultValue false
     */
    debug: boolean;
}

export class ParseContext<T> {
    maxDepth: number;
    debug: boolean;

    protected _scopes: ParseScope<T>[];
    protected _curr: ParseScope<T>;

    constructor(public reader: IReader<T>, opts?: Partial<ContextOpts>) {
        opts = { maxDepth: 32, debug: false, ...opts };
        this.maxDepth = opts.maxDepth!;
        this.debug = opts.debug!;
        this._curr = {
            id: "root",
            state: { p: 0, l: 1, c: 1 },
            children: null,
            result: null,
        };
        this._scopes = [this._curr];
        reader.isDone(this._curr.state);
    }

    start(id: string) {
        if (this._scopes.length >= this.maxDepth) {
            parseError(this, `recursion limit reached ${this.maxDepth}`);
        }
        const scopes = this._scopes;
        const scope: ParseScope<T> = {
            id,
            state: { ...scopes[scopes.length - 1].state },
            children: null,
            result: null,
        };
        scopes.push(scope);
        if (this.debug) {
            console.log(
                `${" ".repeat(scopes.length)}start: ${id} (${scope.state.p})`
            );
        }
        return (this._curr = scope);
    }

    discard() {
        const scopes = this._scopes;
        const child = scopes.pop()!;
        this._curr = scopes[scopes.length - 1];
        if (this.debug) {
            console.log(`${" ".repeat(scopes.length + 1)}discard: ${child.id}`);
        }
        return false;
    }

    end() {
        const scopes = this._scopes;
        const child = scopes.pop()!;
        const parent = scopes[scopes.length - 1];
        const cstate = child.state;
        const pstate = parent.state;
        if (this.debug) {
            console.log(
                `${" ".repeat(scopes.length + 1)}end: ${child.id} (${cstate.p})`
            );
        }
        child.state = { p: pstate.p, l: pstate.l, c: pstate.c };
        parent.state = cstate;
        const children = parent.children;
        children ? children.push(child) : (parent.children = [child]);
        this._curr = parent;
        return true;
    }

    addChild(id: string, result: any = null) {
        const curr = this._curr;
        const cstate = curr.state;
        const child: ParseScope<T> = {
            id,
            state: { p: cstate.p, l: cstate.l, c: cstate.c },
            children: null,
            result,
        };
        const children = curr.children;
        children ? children.push(child) : (curr.children = [child]);
        return child;
    }

    get scope() {
        return this._curr;
    }

    get state() {
        return this._curr.state;
    }

    get done() {
        return this._curr.state.done;
    }

    get result() {
        return this._curr.children ? this._curr.children[0].result : undefined;
    }
}

/**
 * Creates new {@link ParseContext} for given input string and context options.
 *
 * @param input -
 * @param opts -
 */
export const defContext = (input: string, opts?: Partial<ContextOpts>) =>
    new ParseContext<string>(defStringReader(input), opts);
