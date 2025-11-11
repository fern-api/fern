import { AbsoluteFilePath, dirname } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { writeFile } from "fs/promises";
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

    const overrideStructure: { paths: Record<string, unknown> } = {
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
                const fernExample: Record<string, unknown> = {
                    name: `AI Enhanced Example ${index + 1}`
                };

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

            overrideStructure.paths[path][method] = {
                "x-fern-examples": xFernExamples
            };
        }
    }

    const overrideFilePath = AbsoluteFilePath.of(`${dirname(sourceFilePath)}/ai_examples_override.yml`);

    try {
        const yamlContent = yaml.dump(overrideStructure, {
            indent: 2,
            lineWidth: -1, // Don't wrap lines
            noRefs: true
        });

        await writeFile(overrideFilePath, yamlContent, "utf-8");
        context.logger.info(`AI enhanced examples written to: ${overrideFilePath}`);
    } catch (error) {
        context.logger.warn(`Failed to write AI examples override file: ${error}`);
        throw error;
    }
}
