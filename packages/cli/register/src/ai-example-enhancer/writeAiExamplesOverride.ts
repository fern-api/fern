import { AbsoluteFilePath, dirname } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";

export interface EnhancedExampleRecord {
    endpoint: string;
    method: string;
    pathParameters?: Record<string, unknown>;
    queryParameters?: Record<string, unknown>;
    headers?: Record<string, unknown>;
    requestBody?: unknown;
    responseBody?: unknown;
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

                if (example.pathParameters && Object.keys(example.pathParameters).length > 0) {
                    fernExample["path-parameters"] = example.pathParameters;
                }

                if (example.queryParameters && Object.keys(example.queryParameters).length > 0) {
                    fernExample["query-parameters"] = example.queryParameters;
                }

                if (example.headers && Object.keys(example.headers).length > 0) {
                    fernExample.headers = example.headers;
                }

                if (example.requestBody !== undefined) {
                    fernExample.request = {
                        body: example.requestBody
                    };
                }

                if (example.responseBody !== undefined) {
                    fernExample.response = {
                        body: example.responseBody
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
        context.logger.info(`AI enhanced examples written to: ${overrideFilePath}`);
    } catch (error) {
        context.logger.warn(`Failed to write AI examples override file: ${error}`);
        throw error;
    }
}
