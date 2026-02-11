import type { Dictionary, NumericDictionary, PartialObject, PropertyName, ValueKeyIteratee } from "lodash";
import { isNull, isPlainObject, mergeWith, omitBy } from "lodash-es";

type AncestorOmissionCriteria = {
    ancestorKeys: string[];
    allowOmissionCursor: boolean;
};

/**
 * Checks if an object looks like an OpenAPI parameter (has both `name` and `in` properties).
 * Per OpenAPI spec, parameters are uniquely identified by name + in combination.
 */
function isOpenApiParameter(obj: unknown): obj is { name: string; in: string } {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "name" in obj &&
        "in" in obj &&
        typeof (obj as Record<string, unknown>).name === "string" &&
        typeof (obj as Record<string, unknown>).in === "string"
    );
}

/**
 * Gets the unique identity key for an OpenAPI parameter.
 */
function getParameterKey(param: { name: string; in: string }): string {
    return `${param.name}::${param.in}`;
}

/**
 * Merges two arrays of OpenAPI parameters by identity (name + in) instead of by index.
 * Per the OpenAPI spec: "A unique parameter is defined by a combination of a name and location."
 */
function mergeParameterArrays<T extends { name: string; in: string }>(base: T[], overrides: T[]): T[] {
    const result = [...base];
    const baseIndex = new Map<string, number>();

    // Build index of base parameters by identity
    base.forEach((param, idx) => {
        baseIndex.set(getParameterKey(param), idx);
    });

    // Merge overrides by identity
    for (const override of overrides) {
        const key = getParameterKey(override);
        const existingIdx = baseIndex.get(key);

        if (existingIdx !== undefined) {
            // Merge with existing parameter at the matching index
            result[existingIdx] = mergeWith({}, result[existingIdx], override) as T;
        } else {
            // Add new parameter
            result.push(override);
            baseIndex.set(key, result.length - 1);
        }
    }

    return result;
}

export function mergeWithOverrides<T extends object>({
    data,
    overrides,
    allowNullKeys
}: {
    data: T;
    overrides: object;
    allowNullKeys?: string[];
}): T {
    const merged = mergeWith(data, mergeWith, overrides, (obj, src) => {
        if (Array.isArray(obj) && Array.isArray(src)) {
            const objIsObjects = obj.every((element) => typeof element === "object");
            const srcIsObjects = src.every((element) => typeof element === "object");

            if (objIsObjects && srcIsObjects) {
                // Check if both arrays look like OpenAPI parameter arrays
                const objIsParams = obj.length > 0 && obj.every(isOpenApiParameter);
                const srcIsParams = src.length > 0 && src.every(isOpenApiParameter);

                if (objIsParams && srcIsParams) {
                    // Merge parameters by identity (name + in) instead of by index
                    return mergeParameterArrays(obj, src);
                }

                // nested arrays of objects are merged by index (default lodash behavior)
                return undefined;
            }

            // nested arrays of primitives are replaced
            return [...src];
        }
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
