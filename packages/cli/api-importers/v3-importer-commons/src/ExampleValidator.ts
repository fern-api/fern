import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverterContext } from "./AbstractConverterContext";
import { ExampleConverter } from "./converters/ExampleConverter";
import { APIError, APIErrorLevel } from "./ErrorCollector";

/**
 * Source of the example being validated
 */
export type ExampleSource = "human" | "ai" | "openapi";

/**
 * Result of validating a single example
 */
export interface ExampleValidationResult {
    isValid: boolean;
    errors: APIError[];
    warnings: APIError[];
    endpointPath: string;
    method: string;
    exampleSource: ExampleSource;
    exampleName?: string;
    validExample?: unknown;
    coerced: boolean;
}

/**
 * Result of validating all examples for an endpoint
 */
export interface EndpointExampleValidationResult {
    endpointPath: string;
    method: string;
    results: ExampleValidationResult[];
    hasInvalidExamples: boolean;
    invalidExampleCount: number;
}

/**
 * Result of validating all examples in an OpenAPI spec
 */
export interface SpecExampleValidationResult {
    endpoints: EndpointExampleValidationResult[];
    totalExamples: number;
    validExamples: number;
    invalidExamples: number;
    hasInvalidHumanExamples: boolean;
    hasInvalidAiExamples: boolean;
    invalidHumanExamples: ExampleValidationResult[];
    invalidAiExamples: ExampleValidationResult[];
}

/**
 * Example to validate
 */
export interface ExampleToValidate {
    endpointPath: string;
    method: string;
    exampleName?: string;
    exampleSource: ExampleSource;
    requestExample?: unknown;
    responseExample?: unknown;
    requestSchema?: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
    responseSchema?: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
}

/**
 * AI example from ai_examples_override.yml
 */
export interface AiExampleOverride {
    endpointPath: string;
    method: string;
    pathParameters?: Record<string, unknown>;
    queryParameters?: Record<string, unknown>;
    headers?: Record<string, unknown>;
    request?: { body?: unknown };
    response?: { body?: unknown };
}

export declare namespace ExampleValidator {
    export interface Args {
        context: AbstractConverterContext<object>;
    }
}

/**
 * Validates examples against OpenAPI schemas.
 *
 * This validator can be used to:
 * 1. Validate human-provided examples (from `examples` or `x-fern-examples`) during `fern check --from-openapi`
 * 2. Validate AI-generated examples from `ai_examples_override.yml` to detect stale examples
 */
export class ExampleValidator {
    private readonly context: AbstractConverterContext<object>;

    constructor({ context }: ExampleValidator.Args) {
        this.context = context;
    }

    /**
     * Validates a single example against its schema
     */
    public validateExample({
        example,
        schema,
        breadcrumbs,
        exampleGenerationStrategy
    }: {
        example: unknown;
        schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        breadcrumbs: string[];
        exampleGenerationStrategy?: "request" | "response";
    }): ExampleConverter.Output {
        const exampleConverter = new ExampleConverter({
            breadcrumbs,
            context: this.context,
            schema,
            example,
            depth: 0,
            exampleGenerationStrategy,
            generateOptionalProperties: false
        });

        return exampleConverter.convert();
    }

    /**
     * Validates an example for an endpoint (request and/or response)
     */
    public validateEndpointExample({
        exampleToValidate
    }: {
        exampleToValidate: ExampleToValidate;
    }): ExampleValidationResult {
        const errors: APIError[] = [];
        const warnings: APIError[] = [];
        let isValid = true;
        let coerced = false;
        let validExample: unknown = undefined;

        const breadcrumbsBase = [exampleToValidate.endpointPath, exampleToValidate.method];

        if (exampleToValidate.requestExample !== undefined && exampleToValidate.requestSchema !== undefined) {
            const requestResult = this.validateExample({
                example: exampleToValidate.requestExample,
                schema: exampleToValidate.requestSchema,
                breadcrumbs: [...breadcrumbsBase, "request"],
                exampleGenerationStrategy: "request"
            });

            if (!requestResult.isValid) {
                isValid = false;
                const errorLevel =
                    exampleToValidate.exampleSource === "human" ? APIErrorLevel.WARNING : APIErrorLevel.ERROR;

                errors.push(
                    ...requestResult.errors.map((error) => ({
                        ...error,
                        level: errorLevel,
                        message: `Invalid request example: ${error.message}`
                    }))
                );
            }

            if (requestResult.coerced) {
                coerced = true;
                warnings.push({
                    level: APIErrorLevel.WARNING,
                    message: `Request example was coerced to match schema`,
                    path: [...breadcrumbsBase, "request"]
                });
            }

            validExample = { request: requestResult.validExample };
        }

        if (exampleToValidate.responseExample !== undefined && exampleToValidate.responseSchema !== undefined) {
            const responseResult = this.validateExample({
                example: exampleToValidate.responseExample,
                schema: exampleToValidate.responseSchema,
                breadcrumbs: [...breadcrumbsBase, "response"],
                exampleGenerationStrategy: "response"
            });

            if (!responseResult.isValid) {
                isValid = false;
                const errorLevel =
                    exampleToValidate.exampleSource === "human" ? APIErrorLevel.WARNING : APIErrorLevel.ERROR;

                errors.push(
                    ...responseResult.errors.map((error) => ({
                        ...error,
                        level: errorLevel,
                        message: `Invalid response example: ${error.message}`
                    }))
                );
            }

            if (responseResult.coerced) {
                coerced = true;
                warnings.push({
                    level: APIErrorLevel.WARNING,
                    message: `Response example was coerced to match schema`,
                    path: [...breadcrumbsBase, "response"]
                });
            }

            validExample = {
                ...(typeof validExample === "object" && validExample !== null ? validExample : {}),
                response: responseResult.validExample
            };
        }

        return {
            isValid,
            errors,
            warnings,
            endpointPath: exampleToValidate.endpointPath,
            method: exampleToValidate.method,
            exampleSource: exampleToValidate.exampleSource,
            exampleName: exampleToValidate.exampleName,
            validExample,
            coerced
        };
    }

    /**
     * Validates AI examples from ai_examples_override.yml
     * Returns a list of invalid examples that should be removed and regenerated
     */
    public validateAiExamples({ aiExamples, spec }: { aiExamples: AiExampleOverride[]; spec: OpenAPIV3_1.Document }): {
        validExamples: AiExampleOverride[];
        invalidExamples: { example: AiExampleOverride; validationResult: ExampleValidationResult }[];
    } {
        const validExamples: AiExampleOverride[] = [];
        const invalidExamples: { example: AiExampleOverride; validationResult: ExampleValidationResult }[] = [];

        for (const aiExample of aiExamples) {
            const { requestSchema, responseSchema } = this.getSchemasForEndpoint({
                spec,
                endpointPath: aiExample.endpointPath,
                method: aiExample.method
            });

            const exampleToValidate: ExampleToValidate = {
                endpointPath: aiExample.endpointPath,
                method: aiExample.method,
                exampleSource: "ai",
                requestExample: aiExample.request?.body,
                responseExample: aiExample.response?.body,
                requestSchema,
                responseSchema
            };

            const result = this.validateEndpointExample({ exampleToValidate });

            if (result.isValid) {
                validExamples.push(aiExample);
            } else {
                invalidExamples.push({ example: aiExample, validationResult: result });
            }
        }

        return { validExamples, invalidExamples };
    }

    /**
     * Validates human examples (from `examples` or `x-fern-examples`) in an OpenAPI spec
     * Returns warnings for invalid examples (non-blocking)
     */
    public validateHumanExamples({ spec }: { spec: OpenAPIV3_1.Document }): SpecExampleValidationResult {
        const endpoints: EndpointExampleValidationResult[] = [];
        let totalExamples = 0;
        let validExamples = 0;
        let invalidExamples = 0;
        const invalidHumanExamples: ExampleValidationResult[] = [];
        const invalidAiExamples: ExampleValidationResult[] = [];

        if (!spec.paths) {
            return {
                endpoints,
                totalExamples,
                validExamples,
                invalidExamples,
                hasInvalidHumanExamples: false,
                hasInvalidAiExamples: false,
                invalidHumanExamples,
                invalidAiExamples
            };
        }

        for (const [path, pathItem] of Object.entries(spec.paths)) {
            if (!pathItem) {
                continue;
            }

            const methods = ["get", "post", "put", "delete", "patch", "options", "head", "trace"] as const;

            for (const method of methods) {
                const operation = pathItem[method];
                if (!operation) {
                    continue;
                }

                const endpointResults: ExampleValidationResult[] = [];

                const { requestSchema, responseSchema } = this.getSchemasForOperation({ operation });

                const examples = this.extractExamplesFromOperation({ operation, path, method });

                for (const example of examples) {
                    totalExamples++;

                    const exampleToValidate: ExampleToValidate = {
                        endpointPath: path,
                        method,
                        exampleName: example.name,
                        exampleSource: example.source,
                        requestExample: example.request,
                        responseExample: example.response,
                        requestSchema,
                        responseSchema
                    };

                    const result = this.validateEndpointExample({ exampleToValidate });
                    endpointResults.push(result);

                    if (result.isValid) {
                        validExamples++;
                    } else {
                        invalidExamples++;
                        if (example.source === "human") {
                            invalidHumanExamples.push(result);
                        } else if (example.source === "ai") {
                            invalidAiExamples.push(result);
                        }
                    }
                }

                if (endpointResults.length > 0) {
                    endpoints.push({
                        endpointPath: path,
                        method,
                        results: endpointResults,
                        hasInvalidExamples: endpointResults.some((r) => !r.isValid),
                        invalidExampleCount: endpointResults.filter((r) => !r.isValid).length
                    });
                }
            }
        }

        return {
            endpoints,
            totalExamples,
            validExamples,
            invalidExamples,
            hasInvalidHumanExamples: invalidHumanExamples.length > 0,
            hasInvalidAiExamples: invalidAiExamples.length > 0,
            invalidHumanExamples,
            invalidAiExamples
        };
    }

    /**
     * Gets the request and response schemas for an endpoint
     */
    private getSchemasForEndpoint({
        spec,
        endpointPath,
        method
    }: {
        spec: OpenAPIV3_1.Document;
        endpointPath: string;
        method: string;
    }): {
        requestSchema?: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        responseSchema?: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
    } {
        const pathItem = spec.paths?.[endpointPath];
        if (!pathItem) {
            return {};
        }

        const operation = pathItem[method.toLowerCase() as keyof OpenAPIV3_1.PathItemObject];
        if (!operation || typeof operation !== "object" || !("responses" in operation)) {
            return {};
        }

        return this.getSchemasForOperation({ operation: operation as OpenAPIV3_1.OperationObject });
    }

    /**
     * Gets the request and response schemas for an operation
     */
    private getSchemasForOperation({ operation }: { operation: OpenAPIV3_1.OperationObject }): {
        requestSchema?: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        responseSchema?: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
    } {
        let requestSchema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined;
        let responseSchema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined;

        if (operation.requestBody && !this.context.isReferenceObject(operation.requestBody)) {
            const content = operation.requestBody.content;
            const jsonContent = content?.["application/json"];
            if (jsonContent?.schema) {
                requestSchema = jsonContent.schema;
            }
        }

        if (operation.responses) {
            const successResponse = operation.responses["200"] || operation.responses["201"];
            if (successResponse && !this.context.isReferenceObject(successResponse)) {
                const content = successResponse.content;
                const jsonContent = content?.["application/json"];
                if (jsonContent?.schema) {
                    responseSchema = jsonContent.schema;
                }
            }
        }

        return { requestSchema, responseSchema };
    }

    /**
     * Extracts examples from an operation (from `examples`, `example`, or `x-fern-examples`)
     */
    private extractExamplesFromOperation({
        operation,
        path,
        method
    }: {
        operation: OpenAPIV3_1.OperationObject;
        path: string;
        method: string;
    }): Array<{
        name?: string;
        source: ExampleSource;
        request?: unknown;
        response?: unknown;
    }> {
        const examples: Array<{
            name?: string;
            source: ExampleSource;
            request?: unknown;
            response?: unknown;
        }> = [];

        if (operation.requestBody && !this.context.isReferenceObject(operation.requestBody)) {
            const content = operation.requestBody.content;
            const jsonContent = content?.["application/json"];

            if (jsonContent?.example !== undefined) {
                examples.push({
                    name: `${method}_${path}_request_example`,
                    source: "openapi",
                    request: jsonContent.example
                });
            }

            if (jsonContent?.examples) {
                for (const [exampleName, exampleValue] of Object.entries(jsonContent.examples)) {
                    const resolvedExample = this.context.isReferenceObject(exampleValue)
                        ? this.context.resolveExample(exampleValue)
                        : exampleValue;

                    if (resolvedExample && typeof resolvedExample === "object" && "value" in resolvedExample) {
                        examples.push({
                            name: exampleName,
                            source: "human",
                            request: (resolvedExample as { value: unknown }).value
                        });
                    }
                }
            }
        }

        if (operation.responses) {
            for (const [statusCode, response] of Object.entries(operation.responses)) {
                if (!response || this.context.isReferenceObject(response)) {
                    continue;
                }

                const content = response.content;
                const jsonContent = content?.["application/json"];

                if (jsonContent?.example !== undefined) {
                    const existingExample = examples.find((e) => e.request !== undefined && e.response === undefined);
                    if (existingExample) {
                        existingExample.response = jsonContent.example;
                    } else {
                        examples.push({
                            name: `${method}_${path}_response_${statusCode}_example`,
                            source: "openapi",
                            response: jsonContent.example
                        });
                    }
                }

                if (jsonContent?.examples) {
                    for (const [exampleName, exampleValue] of Object.entries(jsonContent.examples)) {
                        const resolvedExample = this.context.isReferenceObject(exampleValue)
                            ? this.context.resolveExample(exampleValue)
                            : exampleValue;

                        if (resolvedExample && typeof resolvedExample === "object" && "value" in resolvedExample) {
                            const existingExample = examples.find((e) => e.name === exampleName);
                            if (existingExample) {
                                existingExample.response = (resolvedExample as { value: unknown }).value;
                            } else {
                                examples.push({
                                    name: exampleName,
                                    source: "human",
                                    response: (resolvedExample as { value: unknown }).value
                                });
                            }
                        }
                    }
                }
            }
        }

        const xFernExamples = (operation as Record<string, unknown>)["x-fern-examples"];
        if (Array.isArray(xFernExamples)) {
            for (const fernExample of xFernExamples) {
                if (typeof fernExample === "object" && fernExample !== null) {
                    const fernExampleObj = fernExample as Record<string, unknown>;
                    examples.push({
                        name: fernExampleObj.name as string | undefined,
                        source: "human",
                        request: (fernExampleObj.request as { body?: unknown } | undefined)?.body,
                        response: (fernExampleObj.response as { body?: unknown } | undefined)?.body
                    });
                }
            }
        }

        return examples;
    }
}
