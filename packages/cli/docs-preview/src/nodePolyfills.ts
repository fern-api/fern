import { writeFileSync } from "fs";
import path from "path";

/**
 * Content of a CommonJS polyfill script that shims Node 22+ APIs
 * for compatibility with Node 20. This script is written to disk
 * and loaded via --require when spawning the Next.js server process.
 *
 * Polyfilled APIs:
 *  - Promise.withResolvers  (ES2024, Node 22+)
 *  - Object.groupBy         (ES2024, Node 21+)
 *  - Map.groupBy            (ES2024, Node 21+)
 *  - Set.prototype methods  (ES2025, Node 22+)
 *      intersection, union, difference, symmetricDifference,
 *      isSubsetOf, isSupersetOf, isDisjointFrom
 *  - Array.fromAsync        (ES2024, Node 22+)
 */
const NODE_POLYFILL_SCRIPT = `"use strict";

// --- Promise.withResolvers (ES2024, Node 22+) ---
if (typeof Promise.withResolvers !== "function") {
    Promise.withResolvers = function withResolvers() {
        var resolve, reject;
        var promise = new this(function (res, rej) {
            resolve = res;
            reject = rej;
        });
        return { promise: promise, resolve: resolve, reject: reject };
    };
}

// --- Object.groupBy (ES2024, Node 21+) ---
if (typeof Object.groupBy !== "function") {
    Object.defineProperty(Object, "groupBy", {
        value: function groupBy(items, callbackFn) {
            var obj = Object.create(null);
            var k = 0;
            for (var item of items) {
                var key = callbackFn(item, k++);
                if (key in obj) {
                    obj[key].push(item);
                } else {
                    obj[key] = [item];
                }
            }
            return obj;
        },
        writable: true,
        enumerable: false,
        configurable: true
    });
}

// --- Map.groupBy (ES2024, Node 21+) ---
if (typeof Map.groupBy !== "function") {
    Object.defineProperty(Map, "groupBy", {
        value: function groupBy(items, callbackFn) {
            var map = new Map();
            var k = 0;
            for (var item of items) {
                var key = callbackFn(item, k++);
                var list = map.get(key);
                if (list) {
                    list.push(item);
                } else {
                    map.set(key, [item]);
                }
            }
            return map;
        },
        writable: true,
        enumerable: false,
        configurable: true
    });
}

// --- Set.prototype methods (ES2025, Node 22+) ---
(function () {
    var SP = Set.prototype;

    if (typeof SP.intersection !== "function") {
        SP.intersection = function intersection(other) {
            var result = new Set();
            for (var item of this) {
                if (other.has(item)) result.add(item);
            }
            return result;
        };
    }

    if (typeof SP.union !== "function") {
        SP.union = function union(other) {
            var result = new Set(this);
            for (var item of other) {
                result.add(item);
            }
            return result;
        };
    }

    if (typeof SP.difference !== "function") {
        SP.difference = function difference(other) {
            var result = new Set();
            for (var item of this) {
                if (!other.has(item)) result.add(item);
            }
            return result;
        };
    }

    if (typeof SP.symmetricDifference !== "function") {
        SP.symmetricDifference = function symmetricDifference(other) {
            var result = new Set(this);
            for (var item of other) {
                if (result.has(item)) {
                    result.delete(item);
                } else {
                    result.add(item);
                }
            }
            return result;
        };
    }

    if (typeof SP.isSubsetOf !== "function") {
        SP.isSubsetOf = function isSubsetOf(other) {
            for (var item of this) {
                if (!other.has(item)) return false;
            }
            return true;
        };
    }

    if (typeof SP.isSupersetOf !== "function") {
        SP.isSupersetOf = function isSupersetOf(other) {
            for (var item of other) {
                if (!this.has(item)) return false;
            }
            return true;
        };
    }

    if (typeof SP.isDisjointFrom !== "function") {
        SP.isDisjointFrom = function isDisjointFrom(other) {
            for (var item of this) {
                if (other.has(item)) return false;
            }
            return true;
        };
    }
})();

// --- Array.fromAsync (ES2024, Node 22+) ---
if (typeof Array.fromAsync !== "function") {
    Object.defineProperty(Array, "fromAsync", {
        value: async function fromAsync(arrayLike, mapFn, thisArg) {
            var result = [];
            var k = 0;
            if (Symbol.asyncIterator in Object(arrayLike) || Symbol.iterator in Object(arrayLike)) {
                for await (var item of arrayLike) {
                    result.push(mapFn ? await mapFn.call(thisArg, item, k) : item);
                    k++;
                }
            } else {
                var len = Number(arrayLike.length) || 0;
                for (var i = 0; i < len; i++) {
                    var val = await arrayLike[i];
                    result.push(mapFn ? mapFn.call(thisArg, val, i) : val);
                }
            }
            return result;
        },
        writable: true,
        enumerable: false,
        configurable: true
    });
}
`;

/**
 * Writes the Node.js polyfill script to the given directory and returns
 * the absolute path to the generated file.
 */
export function writeNodePolyfillScript(dir: string): string {
    const filePath = path.join(dir, "node-polyfills.cjs");
    writeFileSync(filePath, NODE_POLYFILL_SCRIPT, "utf-8");
    return filePath;
}
