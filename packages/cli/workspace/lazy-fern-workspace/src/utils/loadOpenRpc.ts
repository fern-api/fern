import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { OpenrpcDocument } from "@open-rpc/meta-schema";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { mergeWithOverrides } from "../loaders/mergeWithOverrides";

function isValidOpenRpcDocument(parsed: unknown): parsed is OpenrpcDocument {
    if (parsed == null || typeof parsed !== "object") {
        return false;
    }
    const doc = parsed as Record<string, unknown>;
    // Check for required fields: openrpc version and methods array
    if (typeof doc.openrpc !== "string") {
        return false;
    }
    if (!Array.isArray(doc.methods)) {
        return false;
    }
    return true;
}

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
    let parsed: unknown;
    try {
        // Try parsing as JSON first
        parsed = JSON.parse(contents);
    } catch (e) {
        // If JSON parsing fails, try YAML
        try {
            parsed = yaml.load(contents);
        } catch (yamlError) {
            throw new Error(
                `Failed to parse OpenRPC document at ${absoluteFilePath}: Invalid JSON or YAML syntax. ${yamlError instanceof Error ? yamlError.message : String(yamlError)}`
            );
        }
    }

    if (!isValidOpenRpcDocument(parsed)) {
        const missingFields: string[] = [];
        if (parsed == null || typeof parsed !== "object") {
            throw new Error(
                `Failed to parse OpenRPC document at ${absoluteFilePath}: Document must be a valid JSON or YAML object.`
            );
        }
        const doc = parsed as Record<string, unknown>;
        if (typeof doc.openrpc !== "string") {
            missingFields.push("openrpc (version string)");
        }
        if (!Array.isArray(doc.methods)) {
            missingFields.push("methods (array)");
        }
        throw new Error(
            `Failed to parse OpenRPC document at ${absoluteFilePath}: Missing or invalid required fields: ${missingFields.join(", ")}.`
        );
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
