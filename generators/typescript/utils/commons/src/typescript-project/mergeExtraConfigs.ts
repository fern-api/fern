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
 * - Plain objects are merged key-by-key. Keys that only exist in `source` are emitted first,
 *   followed by `target`'s keys in their original order. This matters for `exports`, where Node
 *   picks the first matching condition: a user-supplied custom condition must precede the
 *   generated `import`/`require`/`default` conditions to ever be selected.
 * - Anything else is replaced by `source`.
 */
function deepMerge(target: unknown, source: unknown): unknown {
    if (isArray(target) && isArray(source)) {
        return [...new Set(source.concat(target))];
    }
    if (isRecord(target) && isRecord(source)) {
        const result: Record<string, unknown> = {};
        for (const key of Object.keys(source)) {
            if (!(key in target)) {
                result[key] = source[key];
            }
        }
        for (const key of Object.keys(target)) {
            result[key] = key in source ? deepMerge(target[key], source[key]) : target[key];
        }
        return result;
    }
    return source;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return isPlainObject(value);
}
