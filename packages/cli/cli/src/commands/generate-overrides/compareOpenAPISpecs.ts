import { AbsoluteFilePath, dirname, doesPathExist, getFilename, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";

import { CliContext } from "../../cli-context/CliContext";

// biome-ignore lint/suspicious/noExplicitAny: OpenAPI specs can have any shape
type OpenAPISpec = Record<string, any>;

/**
 * Compares two OpenAPI specs and generates an overrides file containing only the differences.
 * The overrides file is written alongside the original file with "-overrides" appended to the name,
 * unless an explicit output path is provided.
 */
export async function compareOpenAPISpecs({
    originalPath,
    modifiedPath,
    outputPath: explicitOutputPath,
    cliContext
}: {
    originalPath: AbsoluteFilePath;
    modifiedPath: AbsoluteFilePath;
    outputPath?: AbsoluteFilePath;
    cliContext: CliContext;
}): Promise<void> {
    await cliContext.runTask(async (context) => {
        // Validate files exist
        if (!(await doesPathExist(originalPath))) {
            return context.failAndThrow(`Original file does not exist: ${originalPath}`);
        }
        if (!(await doesPathExist(modifiedPath))) {
            return context.failAndThrow(`Modified file does not exist: ${modifiedPath}`);
        }

        context.logger.info(`Comparing ${originalPath} with ${modifiedPath}`);

        // Load both specs
        const original = await loadSpec(originalPath, context);
        const modified = await loadSpec(modifiedPath, context);

        // Generate overrides by diffing
        const overrides = generateOverrides(original, modified);

        if (Object.keys(overrides).length === 0) {
            context.logger.info("No differences found between the two specs.");
            return;
        }

        // Determine output path
        let outputPath: AbsoluteFilePath;
        if (explicitOutputPath != null) {
            outputPath = explicitOutputPath;
        } else {
            const specFilename = getFilename(originalPath);
            let overridesFilename = "openapi-overrides.yml"; // fallback
            if (specFilename != null) {
                const lastDotIndex = specFilename.lastIndexOf(".");
                if (lastDotIndex > 0) {
                    const nameWithoutExt = specFilename.substring(0, lastDotIndex);
                    overridesFilename = `${nameWithoutExt}-overrides.yml`;
                }
            }
            outputPath = join(dirname(originalPath), RelativeFilePath.of(overridesFilename));
        }

        // Write the overrides file
        await writeFile(outputPath, yaml.dump(overrides, { lineWidth: -1, noRefs: true }));

        context.logger.info(`Overrides written to ${outputPath}`);
    });
}

// biome-ignore lint/suspicious/noExplicitAny: OpenAPI specs can have any shape
async function loadSpec(filepath: AbsoluteFilePath, context: any): Promise<OpenAPISpec> {
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
 * Generates an overrides object by comparing original and modified specs.
 * Only includes paths/properties that have been added or changed in the modified spec.
 */
function generateOverrides(original: OpenAPISpec, modified: OpenAPISpec): OpenAPISpec {
    const overrides: OpenAPISpec = {};

    // Compare all top-level properties from the modified spec
    // This handles both OpenAPI 3.x (components) and Swagger 2.0 (definitions)
    for (const key of Object.keys(modified)) {
        if (modified[key] !== undefined) {
            const diff = diffObjects(original[key], modified[key], key);
            if (diff !== undefined && Object.keys(diff).length > 0) {
                overrides[key] = diff;
            }
        }
    }

    return overrides;
}

/**
 * Recursively diff two objects and return only the differences.
 * Returns undefined if there are no differences.
 */
// biome-ignore lint/suspicious/noExplicitAny: recursive diff needs any
function diffObjects(original: any, modified: any, path: string): any {
    // Handle undefined/null cases
    if (modified === undefined) {
        return undefined;
    }
    if (original === undefined || original === null) {
        return modified;
    }

    // Handle primitive types
    if (typeof modified !== "object" || modified === null) {
        if (original !== modified) {
            return modified;
        }
        return undefined;
    }

    // Handle arrays - for OpenAPI, arrays are usually treated as whole replacements
    if (Array.isArray(modified)) {
        if (!deepEqual(original, modified)) {
            return modified;
        }
        return undefined;
    }

    // Handle objects
    if (typeof original !== "object" || original === null || Array.isArray(original)) {
        return modified;
    }

    const diff: Record<string, unknown> = {};

    // Check for modified or added keys
    for (const key of Object.keys(modified)) {
        const childDiff = diffObjects(original[key], modified[key], `${path}.${key}`);
        if (childDiff !== undefined) {
            diff[key] = childDiff;
        }
    }

    // Note: We don't include deleted keys in overrides because OpenAPI overrides
    // typically only add/modify, not delete. If deletion is needed, users should
    // use x-fern-ignore or similar extensions.

    if (Object.keys(diff).length === 0) {
        return undefined;
    }

    return diff;
}

/**
 * Deep equality check for two values
 */
// biome-ignore lint/suspicious/noExplicitAny: deep equality needs any
function deepEqual(a: any, b: any): boolean {
    if (a === b) {
        return true;
    }

    if (a === null || b === null || a === undefined || b === undefined) {
        return a === b;
    }

    if (typeof a !== typeof b) {
        return false;
    }

    if (typeof a !== "object") {
        return a === b;
    }

    if (Array.isArray(a) !== Array.isArray(b)) {
        return false;
    }

    if (Array.isArray(a)) {
        if (a.length !== b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) {
                return false;
            }
        }
        return true;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
        return false;
    }

    for (const key of keysA) {
        if (!Object.hasOwn(b, key)) {
            return false;
        }
        if (!deepEqual(a[key], b[key])) {
            return false;
        }
    }

    return true;
}
