import { isArray, isPlainObject, mergeWith } from "lodash-es";
import { IPackageJson } from "package-json-type";

export function mergeExtraConfigs(
    packageJson: IPackageJson,
    extraConfigs: Record<string, unknown> | undefined
): IPackageJson {
    return mergeWith(
        JSON.parse(JSON.stringify(packageJson)),
        extraConfigs ?? {},
        (objValue: unknown, srcValue: unknown) => deepMerge(objValue, srcValue)
    );
}

/**
 * Recursively merges `source` into `target`. Values from `source` win at every level.
 *
 * - Arrays are unioned (source entries first) and deduplicated.
 * - Plain objects are merged key-by-key. `source`'s keys are emitted first, in `source` order,
 *   followed by any remaining `target` keys in their original order. This matters for `exports`,
 *   where Node picks the first matching condition: a user-supplied custom condition precedes the
 *   generated `import`/`require`/`default` conditions, and a user who spells out a full entry
 *   keeps exactly the order they wrote. Keys not mentioned by `source` cannot be removed.
 * - Anything else is replaced by `source`.
 */
function deepMerge(target: unknown, source: unknown): unknown {
    if (isArray(target) && isArray(source)) {
        return [...new Set(source.concat(target))];
    }
    if (isRecord(target) && isRecord(source)) {
        const result: Record<string, unknown> = {};
        for (const key of Object.keys(source)) {
            result[key] = Object.hasOwn(target, key) ? deepMerge(target[key], source[key]) : source[key];
        }
        for (const key of Object.keys(target)) {
            if (!Object.hasOwn(source, key)) {
                result[key] = target[key];
            }
        }
        return result;
    }
    return source;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return isPlainObject(value);
}
