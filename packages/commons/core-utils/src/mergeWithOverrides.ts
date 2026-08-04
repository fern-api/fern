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
    const merged = mergeWith(data, mergeWith, overrides, overridesCustomizer) as T;
    // Remove any nullified values
    const filtered = omitDeepBy(merged, isNull, {
        ancestorKeys: allowNullKeys ?? [],
        allowOmissionCursor: false
    });
    return filtered as T;
}

function overridesCustomizer(obj: unknown, src: unknown): unknown {
    if (!Array.isArray(obj) || !Array.isArray(src)) {
        return undefined;
    }
    if (!src.every((element) => typeof element === "object") || !obj.every((element) => typeof element === "object")) {
        // nested arrays of primitives are replaced
        return [...src];
    }
    // arrays whose entries are all identified by a name (e.g. OpenAPI parameters) are
    // merged by that identity rather than by position
    return mergeArraysByIdentity(obj, src) ?? undefined;
}

type NamedEntry = { name: string; in?: unknown };

function isNamedEntry(value: unknown): value is NamedEntry {
    return isPlainObject(value) && typeof (value as { name?: unknown }).name === "string";
}

/**
 * Merges two arrays of named entries by matching on `name` instead of by array position. When
 * several entries share a name, `in` disambiguates them. Overrides that match nothing are
 * appended. Returns undefined when either array contains an entry without a name, in which case
 * the caller falls back to a positional merge.
 */
function mergeArraysByIdentity(obj: unknown[], src: unknown[]): unknown[] | undefined {
    if (!obj.every(isNamedEntry) || !src.every(isNamedEntry)) {
        return undefined;
    }
    const unmatchedIndicesByName = new Map<string, number[]>();
    obj.forEach((entry, index) => {
        const indices = unmatchedIndicesByName.get(entry.name);
        if (indices != null) {
            indices.push(index);
        } else {
            unmatchedIndicesByName.set(entry.name, [index]);
        }
    });

    const merged: unknown[] = [...obj];
    for (const override of src) {
        const candidates = unmatchedIndicesByName.get(override.name) ?? [];
        const matchIndex =
            candidates.length > 1 && typeof override.in === "string"
                ? candidates.find((index) => obj[index]?.in === override.in)
                : candidates[0];
        if (matchIndex == null) {
            merged.push(override);
            continue;
        }
        unmatchedIndicesByName.set(
            override.name,
            candidates.filter((index) => index !== matchIndex)
        );
        merged[matchIndex] = mergeWith(obj[matchIndex], override, overridesCustomizer);
    }
    return merged;
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
