/**
 * LazyResult is a type that transparently unwraps functions with no required parameters to their return type.
 *
 * Functions with zero parameters `() => T` become properties of type `T`.
 * Functions with parameters `(arg: X) => T` remain as callable functions.
 *
 * @example
 * ```typescript
 * type Input = {
 *   foo: () => string;           // Zero params
 *   bar: (x: number) => string;  // One param
 *   baz: (x?: number) => string; // Optional param
 * };
 *
 * type Output = LazyResult<Input>;
 * // Output is:
 * // {
 * //   foo: string;                // Unwrapped to return type
 * //   bar: (x: number) => string; // Kept as function
 * //   baz: (x?: number) => string; // Kept as function
 * // }
 * ```
 */
type LazyResult<T> = {
    // If it's a function AND has no required parameters, check if it's truly zero-param
    [K in keyof T]: T[K] extends (...args: infer Args) => infer R
        ? Args extends [] // True zero-parameter function
            ? R // Unwrap to return type
            : T[K] // Keep as function (has parameters, even if optional)
        : T[K]; // Not a function, keep as-is
};

/**
 * Creates an object with lazy-evaluated, cached properties from factory functions.
 *
 * This function transforms an object of factory functions into an object where:
 * - Zero-parameter functions become lazy-evaluated, cached properties (computed once on first access)
 * - Functions with parameters remain as regular methods (called every time)
 *
 * The distinction is made at runtime using `fn.length` (number of parameters).
 *
 * @param factories - An object where values are factory functions
 * @returns An object with the same keys, but zero-param functions become cached properties
 *
 * @example
 * ```typescript
 * const obj = lazy({
 *   // Zero-param: becomes a cached property
 *   name: () => computeExpensiveName(),
 *
 *   // With param: remains a callable method
 *   greet: (person: string) => `Hello, ${person}!`
 * });
 *
 * // Access as property (computed once, then cached)
 * console.log(obj.name); // string
 * console.log(obj.name); // Same value, from cache
 *
 * // Call as method (computed every time)
 * console.log(obj.greet("Alice")); // "Hello, Alice!"
 * console.log(obj.greet("Bob"));   // "Hello, Bob!"
 * ```
 */
export function lazy<T extends Record<string, (...args: never[]) => unknown>>(factories: T): LazyResult<T> {
    const cache = {} as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const [key, fn] of Object.entries(factories)) {
        if (fn.length === 0) {
            // No parameters - make it a lazy cached property
            Object.defineProperty(result, key, {
                get() {
                    if (!(key in cache)) {
                        cache[key] = fn();
                    }
                    return cache[key];
                },
                enumerable: true,
                configurable: true
            });
        } else {
            // Has parameters - just assign the method directly
            result[key] = fn;
        }
    }

    return result as LazyResult<T>;
}
