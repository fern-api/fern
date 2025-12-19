/**
 * Extracts all object types recursively from a type graph, excluding:
 * - Built-in types (string, number, boolean, Date, etc.)
 * - Functions
 * - Primitives
 */

// Check if a type is a primitive
type IsPrimitive<T> = T extends string | number | boolean | bigint | symbol | null | undefined ? true : false;

// Check if a type is a function (including callable objects with call signatures)
type IsFunction<T> =
    // Check for regular function type
    T extends (...args: unknown[]) => unknown
        ? true
        : // Check for callable object with call signature
          T extends { (...args: unknown[]): unknown }
          ? true
          : // Check if it has only a call signature (no other properties)
            T extends (...args: unknown[]) => unknown
            ? true
            : false;

// Extract element type from array
type UnwrapArray<T> = T extends Array<infer U> ? U : T extends ReadonlyArray<infer U> ? U : never;

// Check if a type is an array
type IsArray<T> = T extends Array<unknown> | ReadonlyArray<unknown> ? true : false;

// Extract element types from built-in containers
type UnwrapContainer<T> = T extends Map<unknown, infer V>
    ? V
    : T extends Set<infer U>
      ? U
      : T extends WeakMap<object, infer V>
        ? V
        : T extends WeakSet<infer U>
          ? U
          : T extends Promise<infer U>
            ? U
            : never;

// Check if a type is a built-in container (Map, Set, etc.)
type IsBuiltInContainer<T> = T extends
    | Map<unknown, unknown>
    | Set<unknown>
    | WeakMap<object, unknown>
    | WeakSet<object>
    | Promise<unknown>
    ? true
    : false;

// Check if a type is a built-in object (Date, RegExp, etc.)
type IsBuiltInObject<T> = T extends Date | RegExp | Error ? true : false;

// Check if a type is a Record (generic object with string/number keys)
type IsRecord<T> = T extends Record<string, unknown>
    ? string extends keyof T
        ? true
        : T extends Record<number, unknown>
          ? number extends keyof T
              ? true
              : false
          : false
    : false;

// Check if we should stop recursion (don't traverse into this type)
type ShouldStopRecursion<T> = IsPrimitive<T> extends true
    ? true
    : IsFunction<T> extends true
      ? true
      : IsBuiltInObject<T> extends true
        ? true
        : false;

// Check if we should include this type in the result
type ShouldIncludeType<T> = IsPrimitive<T> extends true
    ? false
    : IsFunction<T> extends true
      ? false
      : IsArray<T> extends true
        ? false
        : IsBuiltInContainer<T> extends true
          ? false
          : IsBuiltInObject<T> extends true
            ? false
            : IsRecord<T> extends true
              ? false
              : T extends object
                ? true
                : false;

// Depth counter helper
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]];

// Extract types from object properties
type ExtractFromProperties<T, Depth extends number> = {
    [K in keyof T]: ExtractTypes<T[K], Depth>;
}[keyof T];

// Handle union types by distributing over them
type ExtractFromUnion<T, Depth extends number> = T extends unknown ? ExtractTypesImpl<T, Depth> : never;

// Implementation of type extraction
type ExtractTypesImpl<T, Depth extends number> = [Depth] extends [never]
    ? never
    : ShouldStopRecursion<T> extends true
      ? never
      : IsArray<T> extends true
        ? ExtractTypes<UnwrapArray<T>, Prev[Depth]>
        : IsBuiltInContainer<T> extends true
          ? ExtractTypes<UnwrapContainer<T>, Prev[Depth]>
          : ShouldIncludeType<T> extends true
            ? T | ExtractFromProperties<T, Prev[Depth]>
            : never;

// Main recursive type extractor with depth limit
type ExtractTypes<T, Depth extends number = 20> = ExtractFromUnion<T, Depth>;

/**
 * TypesOf - Recursively extracts all object types from a type graph
 *
 * @example
 * type User = { id: number; name: string; profile: Profile };
 * type Profile = { bio: string; settings: Settings };
 * type Settings = { theme: string; notifications: boolean };
 *
 * type AllTypes = TypesOf<User>;
 * // Result: User | Profile | Settings
 *
 * const myVar: AllTypes = { theme: "dark", notifications: true }; // Valid!
 */
// Force full evaluation by distributing over a union
type Evaluate<T> = T extends infer U ? U : never;

// Filter out any remaining functions from the final union
type FilterFunctions<T> = T extends unknown ? (IsFunction<T> extends true ? never : T) : never;

export type TypesOf<T> = FilterFunctions<Evaluate<ExtractTypes<T>>>;
