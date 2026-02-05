import { getOpenAPISettings } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath, dirname } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { OpenAPIConverterContext3_1 } from "@fern-api/openapi-to-ir";
import { TaskContext } from "@fern-api/task-context";
import {
    type AiExampleOverride,
    type APIError,
    ErrorCollector,
    type ExampleValidationResult,
    ExampleValidator
} from "@fern-api/v3-importer-commons";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { OpenAPIV3_1 } from "openapi-types";

/**
 * Result of validating AI examples
 */
export interface AiExampleValidationResult {
    validExamples: AiExampleOverride[];
    invalidExamples: { example: AiExampleOverride; validationResult: ExampleValidationResult }[];
    totalExamples: number;
    validCount: number;
    invalidCount: number;
}

/**
 * Parses AI examples from ai_examples_override.yml file
 */
export async function parseAiExamplesOverride(
    sourceFilePath: AbsoluteFilePath,
    context: TaskContext
): Promise<AiExampleOverride[]> {
    const overrideFilePath = AbsoluteFilePath.of(`${dirname(sourceFilePath)}/ai_examples_override.yml`);
    const aiExamples: AiExampleOverride[] = [];

    try {
        const existingContent = await readFile(overrideFilePath, "utf-8");
        const parsed = yaml.load(existingContent);

        if (parsed && typeof parsed === "object" && "paths" in parsed) {
            const paths = parsed.paths as Record<string, Record<string, unknown>>;
            for (const [path, methods] of Object.entries(paths)) {
                if (methods && typeof methods === "object") {
                    for (const [method, methodData] of Object.entries(methods)) {
                        if (methodData && typeof methodData === "object" && "x-fern-examples" in methodData) {
                            const examples = (methodData as { "x-fern-examples": unknown[] })["x-fern-examples"];
                            if (Array.isArray(examples)) {
                                for (const example of examples) {
                                    if (typeof example === "object" && example !== null) {
                                        const exampleObj = example as Record<string, unknown>;
                                        aiExamples.push({
                                            endpointPath: path,
                                            method: method.toUpperCase(),
                                            pathParameters: exampleObj["path-parameters"] as
                                                | Record<string, unknown>
                                                | undefined,
                                            queryParameters: exampleObj["query-parameters"] as
                                                | Record<string, unknown>
                                                | undefined,
                                            headers: exampleObj.headers as Record<string, unknown> | undefined,
                                            request: exampleObj.request as { body?: unknown } | undefined,
                                            response: exampleObj.response as { body?: unknown } | undefined
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        context.logger.debug(`Parsed ${aiExamples.length} AI examples from ai_examples_override.yml`);
    } catch (error) {
        context.logger.debug(`No existing ai_examples_override.yml found or error reading it: ${error}`);
    }

    return aiExamples;
}

/**
 * Validates AI examples from ai_examples_override.yml against the OpenAPI spec
 * Returns valid and invalid examples, allowing the pipeline to remove stale examples
 */
export async function validateAiExamplesFromFile({
    sourceFilePath,
    context
}: {
    sourceFilePath: AbsoluteFilePath;
    context: TaskContext;
}): Promise<AiExampleValidationResult> {
    const aiExamples = await parseAiExamplesOverride(sourceFilePath, context);

    if (aiExamples.length === 0) {
        return {
            validExamples: [],
            invalidExamples: [],
            totalExamples: 0,
            validCount: 0,
            invalidCount: 0
        };
    }

    let spec: OpenAPIV3_1.Document;
    try {
        const specContent = await readFile(sourceFilePath, "utf-8");
        try {
            spec = JSON.parse(specContent) as OpenAPIV3_1.Document;
        } catch {
            spec = yaml.load(specContent) as OpenAPIV3_1.Document;
        }
    } catch (error) {
        context.logger.warn(`Failed to read OpenAPI spec file: ${error}`);
        return {
            validExamples: aiExamples,
            invalidExamples: [],
            totalExamples: aiExamples.length,
            validCount: aiExamples.length,
            invalidCount: 0
        };
    }

    const errorCollector = new ErrorCollector({ logger: context.logger });
    const converterContext = new OpenAPIConverterContext3_1({
        namespace: undefined,
        generationLanguage: "typescript",
        logger: context.logger,
        smartCasing: false,
        spec,
        exampleGenerationArgs: { disabled: false },
        errorCollector,
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: false,
        settings: getOpenAPISettings()
    });

    const validator = new ExampleValidator({ context: converterContext });
    const { validExamples, invalidExamples } = validator.validateAiExamples({
        aiExamples,
        spec
    });

    if (invalidExamples.length > 0) {
        context.logger.info(
            `Found ${invalidExamples.length} stale AI examples that need to be regenerated out of ${aiExamples.length} total`
        );
        for (const { example, validationResult } of invalidExamples) {
            context.logger.debug(
                `Stale AI example: ${example.method} ${example.endpointPath} - ${validationResult.errors.map((e: APIError) => e.message).join(", ")}`
            );
        }
    }

    return {
        validExamples,
        invalidExamples,
        totalExamples: aiExamples.length,
        validCount: validExamples.length,
        invalidCount: invalidExamples.length
    };
}

/**
 * Removes invalid AI examples from the ai_examples_override.yml file
 * This is useful for cleaning up stale examples before regenerating them
 */
export async function removeInvalidAiExamples({
    sourceFilePath,
    context
}: {
    sourceFilePath: AbsoluteFilePath;
    context: TaskContext;
}): Promise<{
    removedCount: number;
    remainingCount: number;
}> {
    const validationResult = await validateAiExamplesFromFile({ sourceFilePath, context });

    if (validationResult.invalidCount === 0) {
        context.logger.debug("No invalid AI examples to remove");
        return {
            removedCount: 0,
            remainingCount: validationResult.totalExamples
        };
    }

    const overrideFilePath = AbsoluteFilePath.of(`${dirname(sourceFilePath)}/ai_examples_override.yml`);

    try {
        const existingContent = await readFile(overrideFilePath, "utf-8");
        const parsed = yaml.load(existingContent) as { paths?: Record<string, Record<string, unknown>> };

        if (!parsed || !parsed.paths) {
            return {
                removedCount: 0,
                remainingCount: validationResult.totalExamples
            };
        }

        const invalidEndpointKeys = new Set(
            validationResult.invalidExamples.map(
                ({ example }) => `${example.method.toLowerCase()}:${example.endpointPath}`
            )
        );

        for (const [path, methods] of Object.entries(parsed.paths)) {
            if (methods && typeof methods === "object") {
                for (const method of Object.keys(methods)) {
                    const key = `${method.toLowerCase()}:${path}`;
                    if (invalidEndpointKeys.has(key)) {
                        delete methods[method];
                    }
                }
                if (Object.keys(methods).length === 0) {
                    delete parsed.paths[path];
                }
            }
        }

        const { writeFile } = await import("fs/promises");
        const yamlContent = yaml.dump(parsed, {
            indent: 2,
            lineWidth: -1,
            noRefs: true
        });

        await writeFile(overrideFilePath, yamlContent, "utf-8");
        context.logger.info(
            `Removed ${validationResult.invalidCount} invalid AI examples from ai_examples_override.yml`
        );

        return {
            removedCount: validationResult.invalidCount,
            remainingCount: validationResult.validCount
        };
    } catch (error) {
        context.logger.warn(`Failed to remove invalid AI examples: ${error}`);
        return {
            removedCount: 0,
            remainingCount: validationResult.totalExamples
        };
    }
}

/**
 * Creates an ExampleValidator instance for use in the AI-examples pipeline
 * This allows the pipeline to validate examples before writing them
 */
export function createExampleValidator({
    spec,
    logger
}: {
    spec: OpenAPIV3_1.Document;
    logger: Logger;
}): ExampleValidator {
    const errorCollector = new ErrorCollector({ logger });
    const converterContext = new OpenAPIConverterContext3_1({
        namespace: undefined,
        generationLanguage: "typescript",
        logger,
        smartCasing: false,
        spec,
        exampleGenerationArgs: { disabled: false },
        errorCollector,
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: false,
        settings: getOpenAPISettings()
    });

    return new ExampleValidator({ context: converterContext });
}
