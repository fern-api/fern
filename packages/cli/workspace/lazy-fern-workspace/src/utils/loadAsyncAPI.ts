import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { AsyncAPIV2, AsyncAPIV3 } from "@fern-api/openapi-ir-parser";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { mergeWithOverrides } from "../loaders/mergeWithOverrides";
import { normalizeRefsDeep } from "./normalizeRefs";

export async function loadAsyncAPI({
    context,
    absoluteFilePath,
    absoluteFilePathToOverrides
}: {
    context: TaskContext;
    absoluteFilePath: AbsoluteFilePath;
    absoluteFilePathToOverrides: AbsoluteFilePath | undefined;
}): Promise<AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3> {
    const contents = (await readFile(absoluteFilePath)).toString();
    const parsed = (await yaml.load(contents)) as AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3;
    normalizeRefsDeep(parsed);
    if (absoluteFilePathToOverrides != null) {
        const merged = await mergeWithOverrides<AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3>({
            absoluteFilePathToOverrides,
            context,
            data: parsed
        });
        normalizeRefsDeep(merged);
        return merged;
    }
    return parsed;
}
