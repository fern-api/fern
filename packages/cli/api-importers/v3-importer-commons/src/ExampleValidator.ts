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
    responseStatusCode?: string;
    responseSchemas?: Record<string, OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject>;
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

        const responseSchemaToUse = this.getResponseSchemaForValidation(exampleToValidate);

        if (exampleToValidate.responseExample !== undefined && responseSchemaToUse !== undefined) {
            const responseResult = this.validateExample({
                example: exampleToValidate.responseExample,
                schema: responseSchemaToUse,
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
     * Gets the appropriate response schema for validation based on status code.
     * If responseStatusCode is provided and responseSchemas contains a schema for that status code, use it.
     * Otherwise, fall back to the legacy responseSchema field for backward compatibility.
     * If no status code is specified, defaults to the success schema (200/201).
     */
    private getResponseSchemaForValidation(
        exampleToValidate: ExampleToValidate
    ): OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined {
        const { responseStatusCode, responseSchemas, responseSchema } = exampleToValidate;

        if (responseSchemas && Object.keys(responseSchemas).length > 0) {
            if (responseStatusCode && responseSchemas[responseStatusCode]) {
                return responseSchemas[responseStatusCode];
            }
            return responseSchemas["200"] ?? responseSchemas["201"];
        }

        return responseSchema;
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
            const { requestSchema, responseSchema, responseSchemas } = this.getSchemasForEndpoint({
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
                responseSchema,
                responseSchemas
            };

            const result = this.validateEndpointExample({ exampleToValidate });

            // For AI examples, also check for unexpected properties (stricter validation for freshness)
            const hasUnexpectedProperties = this.hasUnexpectedProperties({
                requestExample: aiExample.request?.body,
                responseExample: aiExample.response?.body,
                requestSchema,
                responseSchema
            });

            // For AI examples, treat warnings or unexpected properties as invalid to ensure freshness
            const hasErrorsOrWarnings = result.errors.length > 0 || result.warnings.length > 0;
            const isStale = !result.isValid || hasErrorsOrWarnings || hasUnexpectedProperties;

            if (!isStale) {
                validExamples.push(aiExample);
            } else {
                invalidExamples.push({ example: aiExample, validationResult: result });
            }
        }

        return { validExamples, invalidExamples };
    }

    /**
     * Check if examples contain unexpected properties (not defined in schema)
     * This is used for AI example freshness validation
     */
    private hasUnexpectedProperties({
        requestExample,
        responseExample,
        requestSchema,
        responseSchema
    }: {
        requestExample?: unknown;
        responseExample?: unknown;
        requestSchema?: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        responseSchema?: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
    }): boolean {
        if (requestExample && requestSchema) {
            if (this.exampleHasUnexpectedProperties(requestExample, requestSchema)) {
                return true;
            }
        }

        if (responseExample && responseSchema) {
            if (this.exampleHasUnexpectedProperties(responseExample, responseSchema)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if a single example has properties not defined in the schema
     */
    private exampleHasUnexpectedProperties(
        example: unknown,
        schemaOrRef: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject
    ): boolean {
        if (!example || typeof example !== "object" || example === null) {
            return false;
        }

        const schema = this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
            schemaOrReference: schemaOrRef,
            breadcrumbs: [],
            skipErrorCollector: true
        });

        if (!schema || !schema.properties) {
            return false;
        }

        const exampleObj = example as Record<string, unknown>;
        const definedProperties = new Set(Object.keys(schema.properties));
        const exampleProperties = Object.keys(exampleObj);

        // Check if any example property is not defined in the schema
        return exampleProperties.some((prop) => !definedProperties.has(prop));
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

                const { requestSchema, responseSchema, responseSchemas } = this.getSchemasForOperation({ operation });

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
                        responseSchema,
                        responseStatusCode: example.statusCode,
                        responseSchemas
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
        responseSchemas: Record<string, OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject>;
    } {
        const pathItem = spec.paths?.[endpointPath];
        if (!pathItem) {
            return { responseSchemas: {} };
        }

        const operation = pathItem[method.toLowerCase() as keyof OpenAPIV3_1.PathItemObject];
        if (!operation || typeof operation !== "object" || !("responses" in operation)) {
            return { responseSchemas: {} };
        }

        return this.getSchemasForOperation({ operation: operation as OpenAPIV3_1.OperationObject });
    }

    /**
     * Gets the request and response schemas for an operation.
     * Returns schemas for all status codes, not just success responses.
     */
    private getSchemasForOperation({ operation }: { operation: OpenAPIV3_1.OperationObject }): {
        requestSchema?: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        responseSchema?: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        responseSchemas: Record<string, OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject>;
    } {
        let requestSchema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined;
        let responseSchema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined;
        const responseSchemas: Record<string, OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject> = {};

        if (operation.requestBody && !this.context.isReferenceObject(operation.requestBody)) {
            const content = operation.requestBody.content;
            const jsonContent = content?.["application/json"];
            if (jsonContent?.schema) {
                requestSchema = jsonContent.schema;
            }
        }

        if (operation.responses) {
            for (const [statusCode, response] of Object.entries(operation.responses)) {
                if (!response || this.context.isReferenceObject(response)) {
                    continue;
                }
                const content = response.content;
                const jsonContent = content?.["application/json"];
                if (jsonContent?.schema) {
                    responseSchemas[statusCode] = jsonContent.schema;
                }
            }
            responseSchema = responseSchemas["200"] ?? responseSchemas["201"];
        }

        return { requestSchema, responseSchema, responseSchemas };
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
        statusCode?: string;
    }> {
        const examples: Array<{
            name?: string;
            source: ExampleSource;
            request?: unknown;
            response?: unknown;
            statusCode?: string;
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
                        existingExample.statusCode = statusCode;
                    } else {
                        examples.push({
                            name: `${method}_${path}_response_${statusCode}_example`,
                            source: "openapi",
                            response: jsonContent.example,
                            statusCode
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
                                existingExample.statusCode = statusCode;
                            } else {
                                examples.push({
                                    name: exampleName,
                                    source: "human",
                                    response: (resolvedExample as { value: unknown }).value,
                                    statusCode
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
