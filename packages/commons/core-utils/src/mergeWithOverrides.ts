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
    // OpenAPI parameter arrays are merged by parameter identity rather than by position
    return mergeParametersByIdentity(obj, src) ?? undefined;
}

type ParameterEntry = { name: string; in: string };

function isParameterEntry(value: unknown): value is ParameterEntry {
    if (!isPlainObject(value)) {
        return false;
    }
    const { name, in: location } = value as { name?: unknown; in?: unknown };
    return typeof name === "string" && typeof location === "string";
}

function identityOf(entry: ParameterEntry): string {
    return `${entry.in}:${entry.name}`;
}

/**
 * Merges two arrays of OpenAPI parameters by matching on `name` and `in` instead of by array
 * position. Overrides that match no parameter are appended. Returns undefined unless every entry
 * on both sides declares both fields, in which case the caller falls back to a positional merge —
 * notably for the sparse, index-aligned diffs produced by `fern api split`, whose entries carry
 * only the keys that changed.
 */
function mergeParametersByIdentity(obj: unknown[], src: unknown[]): unknown[] | undefined {
    if (!obj.every(isParameterEntry) || !src.every(isParameterEntry)) {
        return undefined;
    }
    const unmatchedIndices = new Map<string, number[]>();
    obj.forEach((entry, index) => {
        const indices = unmatchedIndices.get(identityOf(entry));
        if (indices != null) {
            indices.push(index);
        } else {
            unmatchedIndices.set(identityOf(entry), [index]);
        }
    });

    const merged: unknown[] = [...obj];
    for (const override of src) {
        const identity = identityOf(override);
        const matchIndex = unmatchedIndices.get(identity)?.shift();
        if (matchIndex == null) {
            merged.push(override);
            continue;
        }
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
