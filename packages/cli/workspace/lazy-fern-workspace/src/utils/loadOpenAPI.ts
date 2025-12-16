import { AbsoluteFilePath, dirname, join, RelativeFilePath } from "@fern-api/fs-utils";
import { FernOpenAPIExtension, OpenAPIExtension } from "@fern-api/openapi-ir-parser";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { OpenAPI } from "openapi-types";

import { mergeWithOverrides } from "../loaders/mergeWithOverrides";
import { parseOpenAPI } from "./parseOpenAPI";

/**
 * Attempts to find a matching OpenAPI path template for a given example path.
 * Handles the case where example paths use literal parameter values while
 * OpenAPI specs use templated parameters in curly braces.
 *
 * @param examplePath - Path with literal parameter values (e.g., "/apis/apiId/versions/versionId")
 * @param availablePaths - OpenAPI path templates (e.g., ["/apis/{apiId}/versions/{versionId}"])
 * @returns The matching OpenAPI path template, or undefined if no match found
 */
function findMatchingOpenAPIPath(examplePath: string, availablePaths: string[]): string | undefined {
    // First try exact match
    if (availablePaths.includes(examplePath)) {
        return examplePath;
    }

    // Try to match path parameters
    // Example: /apis/apiId/versions/versionId should match /apis/{apiId}/versions/{versionId}
    for (const openApiPath of availablePaths) {
        // Convert OpenAPI path template to regex
        // /apis/{apiId}/versions/{versionId} -> /apis/([^/]+)/versions/([^/]+)
        const regexPattern = openApiPath.replace(/\{[^}]+\}/g, "([^/]+)");
        const regex = new RegExp(`^${regexPattern}$`);

        if (regex.test(examplePath)) {
            return openApiPath;
        }
    }

    return undefined;
}

// NOTE: This will affect any property that is explicitly named with this. This will preserve null values underneath
// the key or any descendants. This is an extreme edge case, but if we want to strip these, we will have to change
// mergeWithOverrides with a more specific grammar.
const OPENAPI_EXAMPLES_KEYS = [
    "examples",
    "example",
    FernOpenAPIExtension.EXAMPLES,
    OpenAPIExtension.REDOCLY_CODE_SAMPLES_CAMEL,
    OpenAPIExtension.REDOCLY_CODE_SAMPLES_KEBAB
];

export async function loadOpenAPI({
    context,
    absolutePathToOpenAPI,
    absolutePathToOpenAPIOverrides
}: {
    context: TaskContext;
    absolutePathToOpenAPI: AbsoluteFilePath;
    absolutePathToOpenAPIOverrides: AbsoluteFilePath | undefined;
}): Promise<OpenAPI.Document> {
    const parsed = await parseOpenAPI({
        absolutePathToOpenAPI
    });

    let overridesFilepath = undefined;
    if (absolutePathToOpenAPIOverrides != null) {
        overridesFilepath = absolutePathToOpenAPIOverrides;
    } else if (
        typeof parsed === "object" &&
        // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
        (parsed as any)[FernOpenAPIExtension.OPENAPI_OVERIDES_FILEPATH] != null
    ) {
        overridesFilepath = join(
            dirname(absolutePathToOpenAPI),
            // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
            RelativeFilePath.of((parsed as any)[FernOpenAPIExtension.OPENAPI_OVERIDES_FILEPATH])
        );
    }

    let result = parsed;

    if (overridesFilepath != null) {
        result = await mergeWithOverrides<OpenAPI.Document>({
            absoluteFilePathToOverrides: overridesFilepath,
            context,
            data: result,
            allowNullKeys: OPENAPI_EXAMPLES_KEYS
        });
    }

    const aiExamplesOverrideFilepath = join(
        dirname(absolutePathToOpenAPI),
        RelativeFilePath.of("ai_examples_override.yml")
    );

    try {
        const overrideContent = await readFile(aiExamplesOverrideFilepath, "utf-8");
        const overrideData = yaml.load(overrideContent) as {
            paths?: Record<string, Record<string, { "x-fern-examples"?: unknown[] }>>;
        };

        if (overrideData?.paths && result.paths) {
            for (const [path, methods] of Object.entries(overrideData.paths)) {
                if (methods && typeof methods === "object") {
                    for (const [method, methodData] of Object.entries(methods)) {
                        const lowerMethod = method.toLowerCase();
                        // Try exact match first
                        let pathItem = result.paths[path];

                        // If no exact match, try pattern matching for path parameters
                        // Example: /apis/apiId/versions/versionId should match /apis/{apiId}/versions/{versionId}
                        if (!pathItem && result.paths) {
                            const matchingPath = findMatchingOpenAPIPath(path, Object.keys(result.paths));
                            if (matchingPath) {
                                pathItem = result.paths[matchingPath];
                                context.logger.debug(
                                    `Matched override path "${path}" to OpenAPI path "${matchingPath}" using pattern matching`
                                );
                            }
                        }

                        if (pathItem && typeof pathItem === "object") {
                            const pathItemObj = pathItem as Record<string, unknown>;
                            const operation = pathItemObj[lowerMethod];
                            if (operation && typeof operation === "object") {
                                const operationObj = operation as Record<string, unknown>;
                                if (!operationObj["x-fern-examples"] && methodData["x-fern-examples"]) {
                                    operationObj["x-fern-examples"] = methodData["x-fern-examples"];
                                    context.logger.debug(
                                        `Added AI examples for ${method.toUpperCase()} ${path} from override file`
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
        context.logger.debug(`Processed AI examples from ${aiExamplesOverrideFilepath}`);
    } catch (error) {
        // Silently ignore if AI examples override file doesn't exist
    }

    if (overridesFilepath != null || result !== parsed) {
        return await parseOpenAPI({
            absolutePathToOpenAPI,
            absolutePathToOpenAPIOverrides,
            parsed: result
        });
    }
    return result;
}
