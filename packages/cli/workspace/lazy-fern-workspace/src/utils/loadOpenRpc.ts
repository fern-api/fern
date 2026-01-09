import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { OpenrpcDocument } from "@open-rpc/meta-schema";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { mergeWithOverrides } from "../loaders/mergeWithOverrides";

export async function loadOpenRpc({
    context,
    absoluteFilePath,
    absoluteFilePathToOverrides
}: {
    context: TaskContext;
    absoluteFilePath: AbsoluteFilePath;
    absoluteFilePathToOverrides: AbsoluteFilePath | AbsoluteFilePath[] | undefined;
}): Promise<OpenrpcDocument> {
    const contents = (await readFile(absoluteFilePath)).toString();
    let parsed: OpenrpcDocument;
    try {
        // Try parsing as JSON first
        parsed = JSON.parse(contents) as OpenrpcDocument;
    } catch (e) {
        // If JSON parsing fails, try YAML
        parsed = yaml.load(contents) as OpenrpcDocument;
    }

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
        result = await mergeWithOverrides<OpenrpcDocument>({
            absoluteFilePathToOverrides: overridesFilepath,
            context,
            data: result
        });
    }

    return result;
}
