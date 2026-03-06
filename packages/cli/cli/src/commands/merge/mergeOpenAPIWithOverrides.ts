import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";

import { CliContext } from "../../cli-context/CliContext.js";

// biome-ignore lint/suspicious/noExplicitAny: OpenAPI specs can have any shape
type OpenAPISpec = Record<string, any>;

/**
 * Merges an AI examples overrides file into an OpenAPI spec.
 * The overrides file contains paths with x-fern-examples that are deep-merged
 * into the corresponding paths/methods in the OpenAPI spec.
 */
export async function mergeOpenAPIWithOverrides({
    openapiPath,
    overridesPath,
    outputPath,
    cliContext
}: {
    openapiPath: AbsoluteFilePath;
    overridesPath: AbsoluteFilePath;
    outputPath: AbsoluteFilePath;
    cliContext: CliContext;
}): Promise<void> {
    await cliContext.runTask(async (context) => {
        // Validate files exist
        if (!(await doesPathExist(openapiPath))) {
            return context.failAndThrow(`OpenAPI spec file does not exist: ${openapiPath}`);
        }
        if (!(await doesPathExist(overridesPath))) {
            return context.failAndThrow(`Overrides file does not exist: ${overridesPath}`);
        }

        context.logger.info(`Merging ${overridesPath} into ${openapiPath}`);

        // Load both files
        const openapi = await loadYamlOrJson(openapiPath, context);
        const overrides = await loadYamlOrJson(overridesPath, context);

        // Deep merge the overrides into the OpenAPI spec
        const merged = deepMerge(openapi, overrides);

        // Determine output format based on input file extension
        const isJson = openapiPath.endsWith(".json");
        const output = isJson ? JSON.stringify(merged, null, 2) : yaml.dump(merged, { lineWidth: -1, noRefs: true });

        await writeFile(outputPath, output);

        context.logger.info(`Merged output written to ${outputPath}`);
    });
}

// biome-ignore lint/suspicious/noExplicitAny: YAML/JSON files can have any shape
async function loadYamlOrJson(filepath: AbsoluteFilePath, context: any): Promise<OpenAPISpec> {
    const contents = await readFile(filepath, "utf8");
    try {
        return JSON.parse(contents);
    } catch {
        try {
            return yaml.load(contents) as OpenAPISpec;
        } catch (err) {
            return context.failAndThrow(`Failed to parse file as JSON or YAML: ${filepath}`);
        }
    }
}

/**
 * Deep merges the source object into the target object.
 * Arrays are replaced entirely (not concatenated).
 * Objects are recursively merged.
 */
// biome-ignore lint/suspicious/noExplicitAny: deep merge needs any
function deepMerge(target: any, source: any): any {
    if (source === undefined || source === null) {
        return target;
    }
    if (target === undefined || target === null) {
        return source;
    }

    // If source is not an object (or is an array), it replaces target
    if (typeof source !== "object" || Array.isArray(source)) {
        return source;
    }

    // If target is not an object (or is an array), source replaces it
    if (typeof target !== "object" || Array.isArray(target)) {
        return source;
    }

    // Both are objects — merge recursively
    const result: Record<string, unknown> = { ...target };
    for (const key of Object.keys(source)) {
        result[key] = deepMerge(target[key], source[key]);
    }
    return result;
}
