import { assertNever, isNonNullish } from "@fern-api/core-utils";
import { Logger } from "@fern-api/logger";
import {
    CustomCodeSample,
    EndpointExample,
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
} from "@fern-api/openapi-ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
import { ExampleTypeFactory } from "../../../schema/examples/ExampleTypeFactory";
import { convertSchemaToSchemaWithExample } from "../../../schema/utils/convertSchemaToSchemaWithExample";
import { isSchemaRequired } from "../../../schema/utils/isSchemaRequired";
import { hasIncompleteExample } from "../hasIncompleteExample";

export class ExampleEndpointFactory {
    private exampleTypeFactory: ExampleTypeFactory;
    private logger: Logger;
    private schemas: Record<string, SchemaWithExample>;

    constructor(schemas: Record<string, SchemaWithExample>, logger: Logger) {
        this.schemas = schemas;
        this.exampleTypeFactory = new ExampleTypeFactory(schemas);
        this.logger = logger;
    }

    public buildEndpointExample(endpoint: EndpointWithExample): EndpointExample | undefined {
        this.logger.debug(`Building endpoint example for ${endpoint.method.toUpperCase()} ${endpoint.path}`);

        const requestSchemaIdResponse = getRequestSchema(endpoint.request);
        const responseSchemaIdResponse = getResponseSchema(endpoint.response);

        let requestExample = undefined;
        if (requestSchemaIdResponse != null && requestSchemaIdResponse.type === "present") {
            const required = this.isSchemaRequired(requestSchemaIdResponse.schema);
            requestExample = this.exampleTypeFactory.buildExample({
                schema: requestSchemaIdResponse.schema,
                example: requestSchemaIdResponse.example?.value ?? requestSchemaIdResponse.example,
                options: {
                    isParameter: false,
                    ignoreOptionals: true
                }
            });
            if (required && requestExample == null) {
                return undefined;
            }
        }

        let responseExample = undefined;
        if (responseSchemaIdResponse != null && responseSchemaIdResponse.type === "present") {
            const required = this.isSchemaRequired(responseSchemaIdResponse.schema);
            responseExample = this.exampleTypeFactory.buildExample({
                schema: responseSchemaIdResponse.schema,
                example: responseSchemaIdResponse.example?.value ?? responseSchemaIdResponse.example,
                options: {
                    isParameter: false,
                    ignoreOptionals: false,
                    maxDepth: 3
                }
            });
            if (required && responseExample == null) {
                return undefined;
            }
        }

        const pathParameters: PathParameterExample[] = [];
        for (const pathParameter of endpoint.pathParameters) {
            const required = this.isSchemaRequired(pathParameter.schema);
            let example = this.exampleTypeFactory.buildExample({
                schema: pathParameter.schema,
                example: undefined,
                options: {
                    name: pathParameter.name,
                    isParameter: true,
                    ignoreOptionals: true
                }
            });
            if (example != null && !isExamplePrimitive(example)) {
                example = undefined;
            }
            if (required && example == null) {
                return undefined;
            } else if (example != null) {
                pathParameters.push({
                    name: pathParameter.name,
                    value: example
                });
            }
        }

        const queryParameters: QueryParameterExample[] = [];
        for (const queryParameter of endpoint.queryParameters) {
            const required = this.isSchemaRequired(queryParameter.schema);
            let example = this.exampleTypeFactory.buildExample({
                schema: queryParameter.schema,
                example: undefined,
                options: {
                    name: queryParameter.name,
                    isParameter: true,
                    ignoreOptionals: true
                }
            });
            if (example != null && !isExamplePrimitive(example)) {
                example = undefined;
            }
            if (required && example == null) {
                return undefined;
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
                example: undefined,
                options: {
                    name: header.name,
                    isParameter: true,
                    ignoreOptionals: true
                }
            });
            if (example != null && !isExamplePrimitive(example)) {
                example = undefined;
            }
            if (required && example == null) {
                return undefined;
            } else if (example != null) {
                headers.push({
                    name: header.name,
                    value: example
                });
            }
        }

        let exampleName = undefined;

        if (requestSchemaIdResponse?.type === "present") {
            exampleName = requestSchemaIdResponse?.example?.name;
            if (exampleName == null && requestSchemaIdResponse?.schema != null) {
                exampleName = getNameFromSchemaWithExample(requestSchemaIdResponse.schema);
            }
        }

        // Get all the code samples from incomplete examples
        const codeSamples = endpoint.examples
            .filter((ex) => hasIncompleteExample(EndpointExample.unknown(ex)))
            .flatMap((example) => (example as RawSchemas.ExampleEndpointCallSchema)["code-samples"])
            .filter((ex): ex is RawSchemas.ExampleCodeSampleSchema => isNonNullish(ex));

        return EndpointExample.full({
            name: exampleName,
            description: undefined,
            pathParameters,
            queryParameters,
            headers,
            request: requestExample,
            response: responseExample,
            codeSamples: this.convertCodeSamples(codeSamples)
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
        while (schema.type === "reference") {
            const resolvedSchema = this.schemas[schema.schema];
            if (resolvedSchema == null) {
                throw new Error(`Unexpected error: Failed to resolve schema reference: ${schema.schema}`);
            }
            schema = resolvedSchema;
        }
        return schema;
    }
}

type SchemaIdResponse =
    | { type: "present"; schema: SchemaWithExample; example: NamedFullExample | undefined }
    | { type: "unsupported" };

function getRequestSchema(request: RequestWithExample | null | undefined): SchemaIdResponse | undefined {
    if (request == null) {
        return undefined;
    }

    if (request.type === "multipart") {
        return {
            type: "present",
            schema: convertMultipartRequestToSchema(request),
            example: undefined
        };
    }

    if (request.type === "json") {
        return { type: "present", schema: request.schema, example: request.fullExamples?.[0] ?? undefined };
    }

    return { type: "unsupported" };
}

function getResponseSchema(response: ResponseWithExample | null | undefined): SchemaIdResponse | undefined {
    if (response == null) {
        return undefined;
    }
    if (response.type !== "json") {
        return { type: "unsupported" };
    }
    return { type: "present", schema: response.schema, example: response.fullExamples?.[0] ?? undefined };
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
                    // TODO: Support file properties in multipart requests
                    const innerSchema = SchemaWithExample.primitive({
                        schema: FernOpenapiIr.PrimitiveSchemaValueWithExample.string({
                            minLength: undefined,
                            maxLength: undefined,
                            example: undefined
                        }),
                        description: property.description,
                        nameOverride: undefined,
                        generatedName: "",
                        groupName: undefined
                    });
                    const maybeArraySchema = property.schema.isArray
                        ? SchemaWithExample.array({
                              value: innerSchema,
                              groupName: undefined,
                              nameOverride: undefined,
                              generatedName: "",
                              description: undefined
                          })
                        : innerSchema;
                    const maybeOptionalSchema = property.schema.isOptional
                        ? SchemaWithExample.optional({
                              value: maybeArraySchema,
                              groupName: undefined,
                              nameOverride: undefined,
                              generatedName: "",
                              description: undefined
                          })
                        : maybeArraySchema;
                    return {
                        key: property.key,
                        schema: maybeOptionalSchema,
                        audiences: [],
                        conflict: {},
                        generatedName: property.key
                    };
                }
                return {
                    key: property.key,
                    // Convert the schema to a schema with example to ensure that the example is generated
                    // This is a workaround for the fact that the example is not getting parsed upstream
                    // TODO: Fix the example parsing upstream
                    schema: convertSchemaToSchemaWithExample(property.schema.value),
                    audiences: [],
                    conflict: {},
                    generatedName: property.key
                };
            })
            .filter(isNonNullish),
        allOf: [],
        allOfPropertyConflicts: [],
        fullExamples: undefined,
        description: request.description,
        nameOverride: undefined,
        generatedName: "",
        groupName: undefined
    });
}
