import { assertNever, isNonNullish } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { Logger } from "@fern-api/logger";
import {
    CustomCodeSample,
    EndpointExample,
    EndpointResponseExample,
    EndpointWithExample,
    FernOpenapiIr,
    FullExample,
    HeaderExample,
    NamedFullExample,
    PathParameterExample,
    QueryParameterExample,
    RequestWithExample,
    ResponseWithExample,
    SchemaWithExample,
    SupportedSdkLanguage
} from "@fern-api/openapi-ir";

import { ExampleTypeFactory } from "../../../schema/examples/ExampleTypeFactory";
import { convertSchemaToSchemaWithExample } from "../../../schema/utils/convertSchemaToSchemaWithExample";
import { isSchemaRequired } from "../../../schema/utils/isSchemaRequired";
import { shouldSkipReadOnly } from "../../../utils/shouldSkipReadOnly";
import { OpenAPIV3ParserContext } from "../OpenAPIV3ParserContext";
import { hasIncompleteExample } from "../hasIncompleteExample";

export class ExampleEndpointFactory {
    private exampleTypeFactory: ExampleTypeFactory;
    private logger: Logger;

    constructor(
        private readonly schemas: Record<string, SchemaWithExample>,
        private readonly context: OpenAPIV3ParserContext
    ) {
        this.schemas = schemas;
        this.exampleTypeFactory = new ExampleTypeFactory(schemas, context.nonRequestReferencedSchemas, context);
        this.logger = context.logger;
    }

    public buildEndpointExample(endpoint: EndpointWithExample): EndpointExample[] {
        this.logger.debug(`Building endpoint example for ${endpoint.method.toUpperCase()} ${endpoint.path}`);

        // pares down the request/response to only multipart or json schemas.
        // other types are not supported in the builder.
        const requestSchemaIdResponse = getRequestSchema(endpoint.request);
        const responseSchemaIdResponse = getResponseSchema(endpoint.response);

        if (requestSchemaIdResponse?.type === "unsupported" || responseSchemaIdResponse?.type === "unsupported") {
            return [];
        }

        // build the request examples. if there are no examples, build an example from the schema.
        // if all the built examples are null, skip building, warn, and return undefined.
        const requestExamples: [id: string | undefined, example: FernOpenapiIr.FullExample][] = [];
        if (requestSchemaIdResponse != null && requestSchemaIdResponse.type === "present") {
            const required = this.isSchemaRequired(requestSchemaIdResponse.schema);

            if (requestSchemaIdResponse.examples.length === 0) {
                const example = this.exampleTypeFactory.buildExample({
                    skipReadonly: shouldSkipReadOnly(endpoint.method),
                    schema: requestSchemaIdResponse.schema,
                    exampleId: undefined,
                    example: undefined,
                    options: {
                        isParameter: false,
                        ignoreOptionals: true
                        // TODO(dsinghvi): Respect depth on request examples
                        // maxDepth: this.context.options.exampleGeneration?.request?.["max-depth"] ?? 0,
                    }
                });
                if (example != null) {
                    requestExamples.push([undefined, example]);
                }
            } else {
                for (const { name: exampleId, value: rawExample } of requestSchemaIdResponse.examples) {
                    const example = this.exampleTypeFactory.buildExample({
                        skipReadonly: shouldSkipReadOnly(endpoint.method),
                        schema: requestSchemaIdResponse.schema,
                        exampleId,
                        example: rawExample,
                        options: {
                            isParameter: false,
                            ignoreOptionals: true
                            // TODO(dsinghvi): Respect depth on request examples
                            // maxDepth: this.context.options.exampleGeneration?.request?.["max-depth"] ?? 0,
                        }
                    });
                    if (example != null) {
                        requestExamples.push([exampleId, example]);
                    }
                }
            }

            if (required && requestExamples.length === 0) {
                this.logger.warn(
                    `Failed to generate required request example for ${endpoint.method.toUpperCase()} ${endpoint.path}`
                );
                return [];
            }
        }

        const responseExamples: [id: string | undefined, example: FernOpenapiIr.EndpointResponseExample][] = [];
        if (responseSchemaIdResponse != null && responseSchemaIdResponse.type === "present") {
            const required = this.isSchemaRequired(responseSchemaIdResponse.schema);

            if (responseSchemaIdResponse.examples.length === 0) {
                const example = this.exampleTypeFactory.buildExample({
                    skipReadonly: false,
                    schema: responseSchemaIdResponse.schema,
                    exampleId: undefined,
                    example: undefined,
                    options: {
                        maxDepth: this.context.options.exampleGeneration?.response?.["max-depth"] ?? 3,
                        isParameter: false,
                        ignoreOptionals: false
                    }
                });
                if (example != null) {
                    if (endpoint.response?.type === "json") {
                        responseExamples.push([undefined, EndpointResponseExample.withoutStreaming(example)]);
                    } else if (
                        endpoint.response?.type === "streamingJson" ||
                        endpoint.response?.type === "streamingSse"
                    ) {
                        responseExamples.push([
                            undefined,
                            EndpointResponseExample.withStreaming({
                                sse: endpoint.response?.type === "streamingSse",
                                events: [example]
                            })
                        ]);
                    }
                }
            } else {
                for (const { name: exampleId, value: rawExample } of responseSchemaIdResponse.examples) {
                    const example = this.exampleTypeFactory.buildExample({
                        skipReadonly: false,
                        schema: responseSchemaIdResponse.schema,
                        exampleId,
                        example: rawExample,
                        options: {
                            maxDepth: this.context.options.exampleGeneration?.response?.["max-depth"] ?? 3,
                            isParameter: false,
                            ignoreOptionals: false
                        }
                    });
                    if (example != null) {
                        if (endpoint.response?.type === "json") {
                            responseExamples.push([exampleId, EndpointResponseExample.withoutStreaming(example)]);
                        } else if (
                            endpoint.response?.type === "streamingJson" ||
                            endpoint.response?.type === "streamingSse"
                        ) {
                            responseExamples.push([
                                undefined,
                                EndpointResponseExample.withStreaming({
                                    sse: endpoint.response?.type === "streamingSse",
                                    events: [example]
                                })
                            ]);
                        }
                    }
                }
            }

            if (required && responseExamples.length === 0) {
                this.logger.warn(
                    `Failed to generate required response example for ${endpoint.method.toUpperCase()} ${endpoint.path}`
                );
                return [];
            }
        }

        const pathParameters: PathParameterExample[] = [];
        for (const pathParameter of endpoint.pathParameters) {
            const required = this.isSchemaRequired(pathParameter.schema);
            let example = this.exampleTypeFactory.buildExample({
                schema: pathParameter.schema,
                exampleId: undefined,
                example: undefined,
                options: {
                    name: pathParameter.name,
                    isParameter: true,
                    ignoreOptionals: true
                }
            });
            if (example != null && !isExamplePrimitive(example)) {
                this.logger.warn(
                    `Expected a primitive example but got ${example.type} for path parameter ${
                        pathParameter.name
                    } for ${endpoint.method.toUpperCase()} ${endpoint.path}`
                );
                example = undefined;
            }
            if (required && example == null) {
                return [];
            } else if (example != null) {
                pathParameters.push({
                    name: pathParameter.name,
                    parameterNameOverride: pathParameter.parameterNameOverride,
                    value: example
                });
            }
        }

        const queryParameters: QueryParameterExample[] = [];
        for (const queryParameter of endpoint.queryParameters) {
            const required = this.isSchemaRequired(queryParameter.schema);
            let example = this.exampleTypeFactory.buildExample({
                schema: queryParameter.schema,
                exampleId: undefined,
                example: undefined,
                options: {
                    name: queryParameter.name,
                    isParameter: true,
                    ignoreOptionals: true
                }
            });
            if (example != null && !isExamplePrimitive(example)) {
                this.logger.warn(
                    `Expected a primitive example but got ${example.type} for query parameter ${
                        queryParameter.name
                    } for ${endpoint.method.toUpperCase()} ${endpoint.path}`
                );
                example = undefined;
            }
            if (required && example == null) {
                return [];
            } else if (example != null) {
                queryParameters.push({
                    name: queryParameter.name,
                    value: example
                });
            }
        }

        const headers: HeaderExample[] = [];
        for (const header of endpoint.headers) {
            const required = this.isSchemaRequired(header.schema);
            let example = this.exampleTypeFactory.buildExample({
                schema: header.schema,
                exampleId: undefined,
                example: undefined,
                options: {
                    name: header.name,
                    isParameter: true,
                    ignoreOptionals: true
                }
            });
            if (example != null && !isExamplePrimitive(example)) {
                this.logger.warn(
                    `Expected a primitive example but got ${example.type} for header ${
                        header.name
                    } for ${endpoint.method.toUpperCase()} ${endpoint.path}`
                );
                example = undefined;
            }
            if (required && example == null) {
                return [];
            } else if (example != null) {
                headers.push({
                    name: header.name,
                    value: example
                });
            }
        }

        let requestResponsePairs: RequestResponsePair[] = [];
        if (endpoint.request != null && endpoint.response != null) {
            requestResponsePairs = consolidateRequestResponseExamples(requestExamples, responseExamples);
        } else if (endpoint.request != null) {
            requestResponsePairs = requestExamples.map(([id, example]) => {
                return { id, request: example, response: undefined };
            });
        } else if (endpoint.response != null) {
            requestResponsePairs = responseExamples.map(([id, example]) => {
                return { id, request: undefined, response: example };
            });
        }

        // Get all the code samples from incomplete examples
        const codeSamples = endpoint.examples
            .filter((ex) => hasIncompleteExample(ex))
            .flatMap((ex) => {
                if (ex.type === "unknown") {
                    if (ex.value != null) {
                        const samples = (ex.value as RawSchemas.ExampleEndpointCallSchema)["code-samples"];
                        if (samples != null) {
                            return this.convertCodeSamples(samples);
                        }
                    }
                    return undefined;
                } else {
                    return ex.codeSamples;
                }
            })
            .filter((ex): ex is CustomCodeSample => isNonNullish(ex));

        if (requestResponsePairs.length === 0) {
            return [
                EndpointExample.full({
                    name: undefined,
                    description: undefined,
                    pathParameters,
                    queryParameters,
                    headers,
                    request: undefined,
                    response: undefined,
                    codeSamples
                })
            ];
        }

        return requestResponsePairs.map(({ id: exampleName, request: requestExample, response: responseExample }) => {
            return EndpointExample.full({
                name: exampleName,
                description: undefined,
                pathParameters,
                queryParameters,
                headers,
                request: requestExample,
                response: responseExample,
                codeSamples
            });
        });
    }

    private convertCodeSamples(codeSamples: RawSchemas.ExampleCodeSampleSchema[]): CustomCodeSample[] {
        return codeSamples
            .map((codeSample) => {
                if ("language" in codeSample) {
                    return CustomCodeSample.language({
                        name: codeSample.name ?? undefined,
                        description: codeSample.docs ?? undefined,
                        language: codeSample.language,
                        code: codeSample.code,
                        install: codeSample.install ?? undefined
                    });
                } else {
                    return CustomCodeSample.sdk({
                        name: codeSample.name ?? undefined,
                        description: codeSample.docs ?? undefined,
                        sdk: codeSample.sdk === "c#" ? SupportedSdkLanguage.Csharp : codeSample.sdk,
                        code: codeSample.code
                    });
                }
            })
            .filter(isNonNullish);
    }

    private isSchemaRequired(schema: SchemaWithExample) {
        return isSchemaRequired(this.getResolvedSchema(schema));
    }

    private getResolvedSchema(schema: SchemaWithExample) {
        return schema;
    }
}

interface RequestResponsePair {
    id: string | undefined;
    request: FernOpenapiIr.FullExample | undefined;
    response: FernOpenapiIr.EndpointResponseExample | undefined;
}

// if request has multiple examples and response has only 1 example, the response example will be repeated for each request example
// if response has multiple examples and request has only 1 example, the request example will be repeated for each response example
// if both request and response have multiple examples, the examples will be paired up by `id`. If there is no matching `id`, the examples will be paired up in order.
// if requests.length !== responses.length, the examples that can be paired up will be paired up, and the remaining will match the first `id=undefined` example.
// if all of these conditions fail, then only the first request and response examples will be paired up.
function consolidateRequestResponseExamples(
    requestExamples: [id: string | undefined, example: FernOpenapiIr.FullExample][],
    responseExamples: [id: string | undefined, example: FernOpenapiIr.EndpointResponseExample][]
): RequestResponsePair[] {
    const pairs: RequestResponsePair[] = [];
    if (requestExamples.length <= 1) {
        const [requestId, requestExample] = requestExamples[0] ?? [];

        if (responseExamples.length === 0) {
            pairs.push({
                id: requestId,
                request: requestExample,
                response: undefined
            });
            return pairs;
        } else {
            for (const [responseId, responseExample] of responseExamples) {
                pairs.push({
                    id: responseId ?? requestId,
                    request: requestExample,
                    response: responseExample
                });
            }
        }
        return pairs;
    }

    if (responseExamples.length <= 1) {
        const [responseId, responseExample] = responseExamples[0] ?? [];

        if (responseExamples.length === 0) {
            pairs.push({
                id: responseId,
                request: undefined,
                response: responseExample
            });
            return pairs;
        } else {
            for (const [requestId, requestExample] of requestExamples) {
                pairs.push({
                    id: requestId ?? responseId,
                    request: requestExample,
                    response: responseExample
                });
            }
        }
        return pairs;
    }

    const visitedResponseIdx = new Set<number>();
    for (const [requestId, requestExample] of requestExamples) {
        // If the request has no id, or response cannot be paired, pair the request with the first response example that has no id, falling back to the first response example
        const fallbackResponseExample =
            responseExamples.find(([responseId]) => responseId == null)?.[1] ?? responseExamples[0]?.[1];

        if (requestId == null) {
            if (fallbackResponseExample == null) {
                continue;
            }
            pairs.push({
                id: undefined,
                request: requestExample,
                response: fallbackResponseExample
            });
            continue;
        }

        let paired = false;
        for (let idx = 0; idx < responseExamples.length; idx++) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const [responseId, responseExample] = responseExamples[idx]!;
            if (responseId == null || visitedResponseIdx.has(idx)) {
                continue;
            }
            if (requestId === responseId) {
                pairs.push({
                    id: requestId,
                    request: requestExample,
                    response: responseExample
                });
                if (responseId != null) {
                    visitedResponseIdx.add(idx);
                }
                paired = true;
            }
        }

        if (!paired && fallbackResponseExample != null) {
            pairs.push({
                id: requestId,
                request: requestExample,
                response: fallbackResponseExample
            });
        }
    }

    for (let idx = 0; idx < responseExamples.length; idx++) {
        if (visitedResponseIdx.has(idx)) {
            continue;
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const [responseId, responseExample] = responseExamples[idx]!;

        const requestExample = requestExamples.find(([requestId]) => requestId == null)?.[1] ?? requestExamples[0]?.[1];

        if (requestExample != null) {
            pairs.push({
                id: responseId,
                request: requestExample,
                response: responseExample
            });
        }
    }

    return pairs;
}

type SchemaIdResponse =
    | {
          type: "present";
          schema: SchemaWithExample;
          // in a majority of cases, there should only be 1 or no example, and we
          examples: NamedFullExample[];
      }
    | { type: "unsupported" };

function getRequestSchema(request: RequestWithExample | null | undefined): SchemaIdResponse | undefined {
    if (request == null) {
        return undefined;
    }

    if (request.type === "multipart") {
        return {
            type: "present",
            schema: convertMultipartRequestToSchema(request),
            examples: []
        };
    }

    if (request.type === "json") {
        return { type: "present", schema: request.schema, examples: request.fullExamples ?? [] };
    }

    return { type: "unsupported" };
}

function getResponseSchema(response: ResponseWithExample | null | undefined): SchemaIdResponse | undefined {
    if (response == null) {
        return undefined;
    }
    if (response.type !== "json" && response.type !== "streamingJson" && response.type !== "streamingSse") {
        return { type: "unsupported" };
    }
    return { type: "present", schema: response.schema, examples: response.fullExamples ?? [] };
}

export function isExamplePrimitive(example: FullExample): boolean {
    switch (example.type) {
        case "primitive":
        case "enum":
        case "literal":
            return true;
        case "unknown":
            return isExamplePrimitive(example);
        case "array":
        case "object":
        case "map":
            return false;
        case "oneOf":
            switch (example.value.type) {
                case "discriminated":
                    return false;
                case "undisciminated":
                    return isExamplePrimitive(example.value.value);
                default:
                    return false;
            }
        default:
            assertNever(example);
    }
}

export function getNameFromSchemaWithExample(schema: SchemaWithExample): string | undefined {
    switch (schema.type) {
        case "primitive":
        case "enum":
        case "literal":
        case "unknown":
        case "array":
        case "map":
        case "optional":
        case "nullable":
        case "reference":
            return undefined;
        case "object":
            return schema.fullExamples?.[0]?.name ?? undefined;
        case "oneOf":
            switch (schema.value.type) {
                case "discriminated":
                    return undefined;
                case "undisciminated":
                    return undefined;
                default:
                    return undefined;
            }
        default:
            assertNever(schema);
    }
}
function convertMultipartRequestToSchema(request: RequestWithExample.Multipart): FernOpenapiIr.SchemaWithExample {
    return SchemaWithExample.object({
        properties: request.properties
            .map((property) => {
                if (property.schema.type === "file") {
                    // TODO: Handle file property examples in the Fern Definition
                    return null;
                }
                return {
                    key: property.key,
                    // Convert the schema to a schema with example to ensure that the example is generated
                    // This is a workaround for the fact that the example is not getting parsed upstream
                    // TODO: Fix the example parsing upstream
                    schema: convertSchemaToSchemaWithExample(property.schema.value),
                    audiences: [],
                    conflict: {},
                    generatedName: property.key,
                    nameOverride: undefined,
                    availability: undefined,
                    readonly: undefined,
                    inline: undefined
                };
            })
            .filter(isNonNullish),
        allOf: [],
        allOfPropertyConflicts: [],
        fullExamples: undefined,
        description: request.description,
        nameOverride: undefined,
        generatedName: "",
        title: undefined,
        groupName: undefined,
        additionalProperties: false,
        availability: undefined,
        source: request.source,
        inline: undefined
    });
}
