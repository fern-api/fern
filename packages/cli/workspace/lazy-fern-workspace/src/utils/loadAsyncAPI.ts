import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { AsyncAPIV2, AsyncAPIV3 } from "@fern-api/openapi-ir-parser";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { mergeWithOverrides } from "../loaders/mergeWithOverrides";

export async function loadAsyncAPI({
    context,
    absoluteFilePath,
    absoluteFilePathToOverrides
}: {
    context: TaskContext;
    absoluteFilePath: AbsoluteFilePath;
    absoluteFilePathToOverrides: AbsoluteFilePath | AbsoluteFilePath[] | undefined;
}): Promise<AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3> {
    const contents = (await readFile(absoluteFilePath)).toString();
    const parsed = (await yaml.load(contents)) as AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3;

    // Normalize overrides to an array for consistent processing
    let overridesFilepaths: AbsoluteFilePath[] = [];
    if (absoluteFilePathToOverrides != null) {
        if (Array.isArray(absoluteFilePathToOverrides)) {
            overridesFilepaths = absoluteFilePathToOverrides;
        } else {
            overridesFilepaths = [absoluteFilePathToOverrides];
        }
    }

    let result = parsed;

    // Apply each override file sequentially in order
    for (const overridesFilepath of overridesFilepaths) {
        result = await mergeWithOverrides<AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3>({
            absoluteFilePathToOverrides: overridesFilepath,
            context,
            data: result
        });
    }

    return result;
}
