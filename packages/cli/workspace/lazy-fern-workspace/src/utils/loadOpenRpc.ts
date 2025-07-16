import { OpenrpcDocument } from "@open-rpc/meta-schema";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { mergeWithOverrides } from "../loaders/mergeWithOverrides";

export async function loadOpenRpc({
    context,
    absoluteFilePath,
    absoluteFilePathToOverrides
}: {
    context: TaskContext;
    absoluteFilePath: AbsoluteFilePath;
    absoluteFilePathToOverrides: AbsoluteFilePath | undefined;
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
    if (absoluteFilePathToOverrides != null) {
        return await mergeWithOverrides<OpenrpcDocument>({
            absoluteFilePathToOverrides,
            context,
            data: parsed
        });
    }
    return parsed;
}
