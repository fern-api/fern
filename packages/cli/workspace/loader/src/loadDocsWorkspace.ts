import { DOCS_CONFIGURATION_FILENAME, docsYml } from "@fern-api/configuration-loader";
import { validateAgainstJsonSchema } from "@fern-api/core-utils";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

import * as DocsYmlJsonSchema from "./docs-yml.schema.json";
import { DocsWorkspace } from "./types/Workspace";

const SKIP_MARKER = Symbol.for("fern:skip");

/**
 * Recursively removes null/undefined values from an object/array structure.
 * Returns SKIP_MARKER for null/undefined values so they can be filtered out.
 * Tracks which paths were removed for logging purposes.
 */
function sanitizeNullValues(value: unknown, path: string[] = [], removedPaths: string[][] = []): unknown {
    if (value == null) {
        removedPaths.push([...path]);
        return SKIP_MARKER;
    }
    if (Array.isArray(value)) {
        const result: unknown[] = [];
        for (let i = 0; i < value.length; i++) {
            const child = sanitizeNullValues(value[i], [...path, String(i)], removedPaths);
            if (child !== SKIP_MARKER) {
                result.push(child);
            }
        }
        return result;
    }
    if (typeof value === "object") {
        const result: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
            const child = sanitizeNullValues(v, [...path, k], removedPaths);
            if (child !== SKIP_MARKER) {
                result[k] = child;
            }
        }
        return result;
    }
    return value;
}

export async function loadDocsWorkspace({
    fernDirectory,
    context
}: {
    fernDirectory: AbsoluteFilePath;
    context: TaskContext;
}): Promise<DocsWorkspace | undefined> {
    const docsConfigurationFile = join(fernDirectory, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME));
    if (!(await doesPathExist(docsConfigurationFile))) {
        return undefined;
    }

    const docsConfiguration = await loadDocsConfiguration({
        absolutePathToDocsDefinition: fernDirectory,
        context
    });
    if (docsConfiguration != null) {
        return {
            type: "docs",
            absoluteFilePath: fernDirectory,
            config: docsConfiguration,
            workspaceName: undefined,
            absoluteFilepathToDocsConfig: join(fernDirectory, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME))
        };
    }
    return undefined;
}

export async function loadDocsConfiguration({
    absolutePathToDocsDefinition,
    context
}: {
    absolutePathToDocsDefinition: AbsoluteFilePath;
    context: TaskContext;
}): Promise<docsYml.RawSchemas.DocsConfiguration | undefined> {
    if (!(await doesPathExist(absolutePathToDocsDefinition))) {
        return undefined;
    }
    const absolutePathOfConfiguration = join(
        absolutePathToDocsDefinition,
        RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME)
    );
    return await loadRawDocsConfiguration({
        absolutePathOfConfiguration,
        context
    });
}

export async function loadRawDocsConfiguration({
    absolutePathOfConfiguration,
    context
}: {
    absolutePathOfConfiguration: AbsoluteFilePath;
    context: TaskContext;
}): Promise<docsYml.RawSchemas.DocsConfiguration> {
    const contentsStr = await readFile(absolutePathOfConfiguration);
    const contentsJson = yaml.load(contentsStr.toString());
    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
    const result = validateAgainstJsonSchema(contentsJson, DocsYmlJsonSchema as any, {
        filePath: absolutePathOfConfiguration
    });
    if (result.success) {
        try {
            return docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow(contentsJson);
        } catch (err) {
            if (
                err instanceof TypeError &&
                typeof err.message === "string" &&
                err.message.includes("Cannot convert undefined or null to object")
            ) {
                // Sanitize null/undefined values and retry parsing
                const removedPaths: string[][] = [];
                const sanitizedJson = sanitizeNullValues(contentsJson, [], removedPaths);

                if (removedPaths.length > 0) {
                    context.logger.warn(
                        `docs.yml contained null/undefined sections that were ignored: ${removedPaths.map((p) => p.join(".")).join(", ")}`
                    );
                }

                try {
                    return docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow(sanitizedJson);
                } catch (retryErr) {
                    throw new Error(
                        `Failed to parse ${absolutePathOfConfiguration}: encountered null or undefined where an object was expected.\n` +
                            `Tried to ignore null/undefined sections but parsing still failed.\n` +
                            `Original error: ${retryErr instanceof Error ? retryErr.message : String(retryErr)}`
                    );
                }
            }
            throw err;
        }
    } else {
        throw new Error(`Failed to parse docs.yml:\n${result.error?.message ?? "Unknown error"}`);
    }
}
