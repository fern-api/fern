import type { Dictionary, NumericDictionary, PartialObject, PropertyName, ValueKeyIteratee } from "lodash";
import { isNull, isPlainObject, mergeWith, omitBy } from "lodash-es";

type AncestorOmissionCriteria = {
    ancestorKeys: string[];
    allowOmissionCursor: boolean;
};

export function mergeWithOverrides<T extends object>({
    data,
    overrides,
    allowNullKeys
}: {
    data: T;
    overrides: object;
    allowNullKeys?: string[];
}): T {
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
    const filtered = omitDeepBy(merged, isNull, {
        ancestorKeys: allowNullKeys ?? [],
        allowOmissionCursor: false
    });
    return filtered as T;
}

// This is essentially lodash's omitBy, but actually running through your object tree.
// The logic has been adapted from https://github.com/siberiacancode/lodash-omitdeep/tree/main.
interface OmitDeepBy {
    <T>(
        object: Dictionary<T> | null | undefined,
        predicate?: ValueKeyIteratee<T>,
        ancestorOmissionCriteria?: AncestorOmissionCriteria
    ): Dictionary<T>;
    <T>(
        object: NumericDictionary<T> | null | undefined,
        predicate?: ValueKeyIteratee<T>,
        ancestorOmissionCriteria?: AncestorOmissionCriteria
    ): NumericDictionary<T>;
    <T extends object>(
        object: T | null | undefined,
        predicate: ValueKeyIteratee<T[keyof T]>,
        ancestorOmissionCriteria?: AncestorOmissionCriteria
    ): PartialObject<T>;
}

export const omitDeepBy: OmitDeepBy = (
    object: unknown,
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    cb: any,
    ancestorOmissionCriteria?: AncestorOmissionCriteria
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
): any => {
    function omitByDeepByOnOwnProps(object: unknown) {
        if (Array.isArray(object)) {
            return object.map((element) => omitDeepBy(element, cb, ancestorOmissionCriteria));
        }

        if (isPlainObject(object)) {
            const temp: Record<string, unknown> = {};
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            for (const [key, value] of Object.entries<Record<string, PropertyName | object>>(object as any)) {
                temp[key] = omitDeepBy(
                    value,
                    cb,
                    ancestorOmissionCriteria != null &&
                        (ancestorOmissionCriteria.allowOmissionCursor ||
                            ancestorOmissionCriteria.ancestorKeys.includes(key))
                        ? {
                              ...ancestorOmissionCriteria,
                              allowOmissionCursor: true
                          }
                        : ancestorOmissionCriteria
                );
            }

            if (ancestorOmissionCriteria == null || !ancestorOmissionCriteria?.allowOmissionCursor) {
                return omitBy(temp, cb);
            }

            return temp;
        }

        return object;
    }

    return omitByDeepByOnOwnProps(object);
};
