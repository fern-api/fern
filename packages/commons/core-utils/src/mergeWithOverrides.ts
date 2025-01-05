import type { Dictionary, NumericDictionary, PartialObject, PropertyName, ValueKeyIteratee } from "lodash";
import { isNull, isPlainObject, mergeWith, omitBy } from "lodash-es";

export function mergeWithOverrides<T extends object>({ data, overrides }: { data: T; overrides: object }): T {
    const merged = mergeWith(data, mergeWith, overrides, (obj, src) =>
        Array.isArray(obj) && Array.isArray(src)
            ? src.every((element) => typeof element === "object") && obj.every((element) => typeof element === "object")
                ? // nested arrays of objects are merged
                  undefined
                : // nested arrays of primitives are replaced
                  [...src]
            : undefined
    ) as T;
    // Remove any nullified values
    const filtered = omitDeepBy(merged, isNull) as T;
    return filtered;
}

// This is essentially lodash's omitBy, but actually running through your object tree.
// The logic has been adapted from https://github.com/siberiacancode/lodash-omitdeep/tree/main.
interface OmitDeepBy {
    <T>(object: Dictionary<T> | null | undefined, predicate?: ValueKeyIteratee<T>): Dictionary<T>;
    <T>(object: NumericDictionary<T> | null | undefined, predicate?: ValueKeyIteratee<T>): NumericDictionary<T>;
    <T extends object>(object: T | null | undefined, predicate: ValueKeyIteratee<T[keyof T]>): PartialObject<T>;
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const omitDeepBy: OmitDeepBy = (object: unknown, cb: any): any => {
    function omitByDeepByOnOwnProps(object: unknown) {
        if (Array.isArray(object)) {
            return object.map((element) => omitDeepBy(element, cb));
        }

        if (isPlainObject(object)) {
            const temp: Record<string, unknown> = {};
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            for (const [key, value] of Object.entries<Record<string, PropertyName | object>>(object as any)) {
                temp[key] = omitDeepBy(value, cb);
            }
            return omitBy(temp, cb);
        }

        return object;
    }

    return omitByDeepByOnOwnProps(object);
};
