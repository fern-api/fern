import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { AsyncAPIV2 } from "@fern-api/openapi-ir-parser";
import { TaskContext } from "@fern-api/task-context";

import { mergeWithOverrides } from "../loaders/mergeWithOverrides";

export async function loadAsyncAPI({
    context,
    absoluteFilePath,
    absoluteFilePathToOverrides
}: {
    context: TaskContext;
    absoluteFilePath: AbsoluteFilePath;
    absoluteFilePathToOverrides: AbsoluteFilePath | undefined;
}): Promise<AsyncAPIV2.Document> {
    const contents = (await readFile(absoluteFilePath)).toString();
    const parsed = (await yaml.load(contents)) as AsyncAPIV2.Document;
    if (absoluteFilePathToOverrides != null) {
        return await mergeWithOverrides<AsyncAPIV2.Document>({
            absoluteFilePathToOverrides,
            context,
            data: parsed
        });
    }
    return parsed;
}
