import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import type { Dictionary, NumericDictionary, PartialObject, PropertyName, ValueKeyIteratee } from "lodash";
import { isNull, isPlainObject, mergeWith, omitBy } from "lodash-es";

export async function mergeWithOverrides<T>({
    absoluteFilepathToOverrides,
    data,
    context
}: {
    absoluteFilepathToOverrides: AbsoluteFilePath;
    data: T;
    context: TaskContext;
}): Promise<T> {
    let parsedOverrides = null;
    try {
        const contents = (await readFile(absoluteFilepathToOverrides, "utf8")).toString();
        try {
            parsedOverrides = JSON.parse(contents);
        } catch (err) {
            parsedOverrides = yaml.load(contents, { json: true });
        }
    } catch (err) {
        return context.failAndThrow(`Failed to read overrides from file ${absoluteFilepathToOverrides}`);
    }

    const merged = mergeWith(data, mergeWith, parsedOverrides, (obj, src) =>
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
export const omitDeepBy: OmitDeepBy = (object: any, cb: any) => {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    function omitByDeepByOnOwnProps(object: any) {
        if (!Array.isArray(object) && !isPlainObject(object)) {
            return object;
        }

        if (Array.isArray(object)) {
            return object.map((element) => omitDeepBy(element, cb));
        }

        const temp = {};
        // eslint-disable-next-line no-restricted-syntax, @typescript-eslint/consistent-indexed-object-style
        for (const [key, value] of Object.entries<{
            [x: string]: PropertyName | object;
        }>(object)) {
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            (temp as any)[key] = omitDeepBy(value, cb);
        }
        return omitBy(temp, cb);
    }

    return omitByDeepByOnOwnProps(object);
};
