import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { mergeWithOverrides as coreMergeWithOverrides } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

export async function mergeWithOverrides<T extends object>({
    absoluteFilePathToOverrides,
    data,
    context
}: {
    absoluteFilePathToOverrides: AbsoluteFilePath;
    data: T;
    context: TaskContext;
}): Promise<T> {
    let parsedOverrides = null;
    try {
        const contents = (await readFile(absoluteFilePathToOverrides, "utf8")).toString();
        try {
            parsedOverrides = JSON.parse(contents);
        } catch (err) {
            parsedOverrides = yaml.load(contents, { json: true });
        }
    } catch (err) {
        return context.failAndThrow(`Failed to read overrides from file ${absoluteFilePathToOverrides}`);
    }
    return coreMergeWithOverrides({ data, overrides: parsedOverrides });
}
