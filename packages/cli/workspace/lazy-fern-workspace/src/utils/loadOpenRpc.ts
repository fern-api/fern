import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { OpenrpcDocument } from "@open-rpc/meta-schema";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { mergeWithOverrides } from "../loaders/mergeWithOverrides";
import { normalizeRefsDeep } from "./normalizeRefs";

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
        parsed = JSON.parse(contents) as OpenrpcDocument;
    } catch (e) {
        parsed = yaml.load(contents) as OpenrpcDocument;
    }
    normalizeRefsDeep(parsed);
    if (absoluteFilePathToOverrides != null) {
        const merged = await mergeWithOverrides<OpenrpcDocument>({
            absoluteFilePathToOverrides,
            context,
            data: parsed
        });
        normalizeRefsDeep(merged);
        return merged;
    }
    return parsed;
}
