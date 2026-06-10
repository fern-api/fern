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
    const merged = mergeWith(data, overrides, (obj: unknown, src: unknown) => {
        if (!Array.isArray(obj) || !Array.isArray(src)) {
            return undefined;
        }
        const allObjObjects = obj.every((element) => typeof element === "object");
        const allSrcObjects = src.every((element) => typeof element === "object");
        if (!allObjObjects || !allSrcObjects) {
            return [...src];
        }
        // When all override items have a "name" property, merge by name identity
        // instead of by array index. This handles OpenAPI parameters arrays where
        // the override may target a subset of parameters in a different order.
        if (src.length > 0 && src.every((element) => element != null && "name" in element)) {
            const result = obj.map((item: Record<string, unknown>) => ({ ...item }));
            for (const srcItem of src) {
                const matchIndex = result.findIndex(
                    (item: Record<string, unknown>) =>
                        item != null &&
                        typeof item === "object" &&
                        item.name === srcItem.name &&
                        (srcItem.in == null || item.in === srcItem.in)
                );
                if (matchIndex !== -1) {
                    result[matchIndex] = mergeWith({}, result[matchIndex], srcItem);
                } else {
                    result.push(srcItem);
                }
            }
            return result;
        }
        // Default: merge arrays of objects by index (lodash default behavior)
        return undefined;
    }) as T;
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
    // biome-ignore lint/suspicious/noExplicitAny: allow
    cb: any,
    ancestorOmissionCriteria?: AncestorOmissionCriteria
    // biome-ignore lint/suspicious/noExplicitAny: allow
): any => {
    function omitByDeepByOnOwnProps(object: unknown) {
        if (Array.isArray(object)) {
            return object.map((element) => omitDeepBy(element, cb, ancestorOmissionCriteria));
        }

        if (isPlainObject(object)) {
            const temp: Record<string, unknown> = {};
            // biome-ignore lint/suspicious/noExplicitAny: allow
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
