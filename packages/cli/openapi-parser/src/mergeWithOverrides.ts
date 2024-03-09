import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { mergeWith } from "lodash-es";

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
    return merged;
}
