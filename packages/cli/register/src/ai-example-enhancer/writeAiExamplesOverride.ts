import { AbsoluteFilePath, dirname } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";

import { filterRequestBody, isEmptyObject, unwrapExampleValue } from "./filterHelpers";

export interface EnhancedExampleRecord {
    endpoint: string;
    method: string;
    pathParameters?: Record<string, unknown>;
    queryParameters?: Record<string, unknown>;
    headers?: Record<string, unknown>;
    requestBody?: unknown;
    responseBody?: unknown;
    headerParameterNames?: string[];
    queryParameterNames?: string[];
    pathParameterNames?: string[];
}

/**
 * Reads the existing ai_examples_override.yml and returns a set of covered endpoints
 */
export async function loadExistingOverrideCoverage(
    sourceFilePath: AbsoluteFilePath,
    context: TaskContext
): Promise<Set<string>> {
    const overrideFilePath = AbsoluteFilePath.of(`${dirname(sourceFilePath)}/ai_examples_override.yml`);
    const coveredEndpoints = new Set<string>();

    try {
        const existingContent = await readFile(overrideFilePath, "utf-8");
        const parsed = yaml.load(existingContent);

        if (parsed && typeof parsed === "object" && "paths" in parsed) {
            const paths = parsed.paths as Record<string, Record<string, unknown>>;
            for (const [path, methods] of Object.entries(paths)) {
                if (methods && typeof methods === "object") {
                    for (const method of Object.keys(methods)) {
                        const key = `${method.toLowerCase()}:${path}`;
                        coveredEndpoints.add(key);
                    }
                }
            }
        }

        context.logger.debug(`Loaded ${coveredEndpoints.size} covered endpoints from ai_examples_override.yml`);
    } catch (error) {
        context.logger.debug(`No existing ai_examples_override.yml found or error reading it`);
    }

    return coveredEndpoints;
}

/**
 * Converts enhanced examples to x-fern-examples format and writes to ai_examples_override.yml
 */
export async function writeAiExamplesOverride({
    enhancedExamples,
    sourceFilePath,
    context
}: {
    enhancedExamples: EnhancedExampleRecord[];
    sourceFilePath: AbsoluteFilePath;
    context: TaskContext;
}): Promise<void> {
    if (enhancedExamples.length === 0) {
        context.logger.debug("No enhanced examples to write");
        return;
    }

    const examplesByPath = new Map<string, EnhancedExampleRecord[]>();
    for (const example of enhancedExamples) {
        const existing = examplesByPath.get(example.endpoint) || [];
        existing.push(example);
        examplesByPath.set(example.endpoint, existing);
    }

    const overrideStructure: {
        paths: Record<string, Record<string, { "x-fern-examples": Record<string, unknown>[] }>>;
    } = {
        paths: {}
    };

    for (const [path, examples] of examplesByPath.entries()) {
        const examplesByMethod = new Map<string, EnhancedExampleRecord[]>();
        for (const example of examples) {
            const existing = examplesByMethod.get(example.method.toLowerCase()) || [];
            existing.push(example);
            examplesByMethod.set(example.method.toLowerCase(), existing);
        }

        if (!overrideStructure.paths[path]) {
            overrideStructure.paths[path] = {};
        }

        for (const [method, methodExamples] of examplesByMethod.entries()) {
            const xFernExamples = methodExamples.map((example, index) => {
                const fernExample: Record<string, unknown> = {};

                // Start with the original path/query/header parameters
                let pathParams = { ...(example.pathParameters ?? {}) };
                let queryParams = { ...(example.queryParameters ?? {}) };
                let headerParams = { ...(example.headers ?? {}) };

                // Build parameter objects for filtering using ONLY spec-defined parameter names
                // This prevents form data fields from being incorrectly extracted as query/path params
                const headersForFiltering: Record<string, unknown> = { ...headerParams };
                if (example.headerParameterNames) {
                    for (const headerName of example.headerParameterNames) {
                        if (!(headerName in headersForFiltering)) {
                            headersForFiltering[headerName] = "";
                        }
                    }
                }

                // Build query params object using spec-defined names only
                const queryParamsForFiltering: Record<string, unknown> = {};
                if (example.queryParameterNames) {
                    for (const queryName of example.queryParameterNames) {
                        queryParamsForFiltering[queryName] = queryParams[queryName] ?? "";
                    }
                }

                // Build path params object using spec-defined names only
                const pathParamsForFiltering: Record<string, unknown> = {};
                if (example.pathParameterNames) {
                    for (const pathName of example.pathParameterNames) {
                        pathParamsForFiltering[pathName] = pathParams[pathName] ?? "";
                    }
                }

                // Unwrap FDR typed value wrappers from request body first
                // This converts { "file": { "type": "filename", "value": "test.wav" } } to { "file": "test.wav" }
                const unwrappedRequestBody = unwrapExampleValue(example.requestBody);

                // Filter out path/query/header params from request body and extract any AI-generated values
                // The AI model sometimes incorrectly includes these in the request body
                // Use spec-defined parameter names to avoid extracting form data fields
                let filteredRequestBody: unknown = unwrappedRequestBody;
                if (unwrappedRequestBody !== undefined) {
                    const { filteredBody, extractedPathParams, extractedQueryParams, extractedHeaders } =
                        filterRequestBody(
                            unwrappedRequestBody,
                            pathParamsForFiltering,
                            queryParamsForFiltering,
                            headersForFiltering
                        );
                    filteredRequestBody = filteredBody;

                    // Merge extracted values into the appropriate parameter sections
                    // Only use extracted values if they provide more meaningful data than the original
                    for (const [key, value] of Object.entries(extractedPathParams)) {
                        if (value !== undefined && value !== null && value !== "") {
                            pathParams[key] = value;
                        }
                    }
                    for (const [key, value] of Object.entries(extractedQueryParams)) {
                        if (value !== undefined && value !== null && value !== "") {
                            queryParams[key] = value;
                        }
                    }
                    for (const [key, value] of Object.entries(extractedHeaders)) {
                        if (value !== undefined && value !== null && value !== "") {
                            headerParams[key] = value;
                        }
                    }
                }

                // Write path parameters if non-empty
                if (Object.keys(pathParams).length > 0) {
                    fernExample["path-parameters"] = pathParams;
                }

                // Write query parameters if non-empty
                if (Object.keys(queryParams).length > 0) {
                    fernExample["query-parameters"] = queryParams;
                }

                // Write headers if non-empty
                if (Object.keys(headerParams).length > 0) {
                    fernExample.headers = headerParams;
                }

                // Only write request if it's non-empty after filtering
                // Note: In x-fern-examples schema, request is directly the value (ExampleTypeReferenceSchema),
                // not wrapped in body. Response uses ExampleBodyResponseSchema which has a body property.
                if (filteredRequestBody !== undefined && !isEmptyObject(filteredRequestBody)) {
                    fernExample.request = filteredRequestBody;
                }

                // Unwrap FDR typed value wrappers from response body and write if non-empty
                const unwrappedResponseBody = unwrapExampleValue(example.responseBody);
                if (unwrappedResponseBody !== undefined && !isEmptyObject(unwrappedResponseBody)) {
                    fernExample.response = {
                        body: unwrappedResponseBody
                    };
                }

                return fernExample;
            });

            const pathMethods = overrideStructure.paths[path];
            if (pathMethods) {
                pathMethods[method] = {
                    "x-fern-examples": xFernExamples
                };
            }
        }
    }

    const overrideFilePath = AbsoluteFilePath.of(`${dirname(sourceFilePath)}/ai_examples_override.yml`);

    try {
        let existingOverride: {
            paths?: Record<string, Record<string, { "x-fern-examples"?: unknown[] }>>;
        } = {};

        try {
            const existingContent = await readFile(overrideFilePath, "utf-8");
            const parsed = yaml.load(existingContent);
            if (parsed && typeof parsed === "object") {
                existingOverride = parsed as typeof existingOverride;
            }
        } catch (readError) {
            context.logger.debug(`No existing ai_examples_override.yml found, creating new file`);
        }

        const mergedStructure: {
            paths: Record<string, Record<string, { "x-fern-examples": Record<string, unknown>[] }>>;
        } = {
            paths: {}
        };

        if (existingOverride.paths) {
            for (const [path, methods] of Object.entries(existingOverride.paths)) {
                if (methods && typeof methods === "object") {
                    mergedStructure.paths[path] = {};
                    for (const [method, methodData] of Object.entries(methods)) {
                        if (methodData && typeof methodData === "object" && "x-fern-examples" in methodData) {
                            mergedStructure.paths[path][method] = {
                                "x-fern-examples": (methodData["x-fern-examples"] as unknown[]) || []
                            } as { "x-fern-examples": Record<string, unknown>[] };
                        }
                    }
                }
            }
        }

        for (const [path, methods] of Object.entries(overrideStructure.paths)) {
            if (!mergedStructure.paths[path]) {
                mergedStructure.paths[path] = {};
            }

            for (const [method, methodData] of Object.entries(methods)) {
                if (!mergedStructure.paths[path][method]) {
                    mergedStructure.paths[path][method] = methodData;
                    context.logger.debug(`Adding new examples for ${method.toUpperCase()} ${path}`);
                } else {
                    context.logger.debug(
                        `Skipping ${method.toUpperCase()} ${path} - examples already exist in override file`
                    );
                }
            }
        }

        const yamlContent = yaml.dump(mergedStructure, {
            indent: 2,
            lineWidth: -1,
            noRefs: true
        });

        await writeFile(overrideFilePath, yamlContent, "utf-8");
        context.logger.debug(`AI enhanced examples written to: ${overrideFilePath}`);
    } catch (error) {
        context.logger.warn(`Failed to write AI examples override file: ${error}`);
        throw error;
    }
}
