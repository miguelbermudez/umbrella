import { Fn0 } from "@thi.ng/api";
import { ICache } from "./api";

export class UnboundedCache<T> implements ICache<T> {
    index: Map<number, T>;

    constructor() {
        this.index = new Map();
    }

    release() {
        this.index.clear();
        return true;
    }

    keys() {
        return this.index.keys();
    }

    set(key: number, val: T): T {
        this.index.set(key, val);
        return val;
    }

    get(key: number): T | undefined {
        return this.index.get(key);
    }

    getSet(key: number, notFound: Fn0<T>): T {
        let val = this.index.get(key);
        return val !== undefined ? val : this.set(key, notFound());
    }

    delete(key: number): boolean {
        return this.index.delete(key);
    }
}