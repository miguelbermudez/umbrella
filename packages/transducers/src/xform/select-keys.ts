import { Transducer } from "../api";
import { keySelector } from "../func/key-selector";
import { iterator1 } from "../iterator";
import { map } from "./map";

/**
 * Transducer which yields sequence of transformed objects, each only
 * only containing the given `keys`. If a key's value is `undefined` (or
 * missing entirely) it will be omitted in the result.
 *
 * Note: For single key extraction `pluck()` is a faster alternative.
 *
 * ```
 * [...selectKeys(
 *   ["id", "age"],
 *   [
 *     {id: 1, age: 23, name: "alice"},
 *     {id: 2, age: 42, name: "bob"},
 *     {id: 3, name: "charlie"},
 *   ]
 * )]
 * // [ { age: 23, id: 1 }, { age: 42, id: 2 }, { id: 3 } ]
 * ```
 *
 * @param keys
 * @param src
 */
export function selectKeys<T>(keys: PropertyKey[]): Transducer<T, any>;
export function selectKeys<T>(
    keys: PropertyKey[],
    src: Iterable<T>
): IterableIterator<any>;
export function selectKeys<T>(keys: PropertyKey[], src?: Iterable<T>): any {
    return src ? iterator1(selectKeys(keys), src) : map(keySelector(keys));
}
