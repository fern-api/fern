import { assertNever } from "@fern-api/core-utils";
import { Logger } from "@fern-api/logger";
import { FullExample } from "@fern-fern/openapi-ir-model/example";
import {
    EndpointExample,
    HeaderExample,
    PathParameterExample,
    QueryParameterExample
} from "@fern-fern/openapi-ir-model/finalIr";
import {
    EndpointWithExample,
    NamedFullExample,
    RequestWithExample,
    ResponseWithExample,
    SchemaWithExample
} from "@fern-fern/openapi-ir-model/parseIr";
import { isSchemaRequired } from "../../utils/isSchemaRequired";
import { ExampleTypeFactory } from "./ExampleTypeFactory";

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

        if (requestSchemaIdResponse?.type === "unsupported" || responseSchemaIdResponse?.type === "unsupported") {
            return undefined;
        }

        let requestExample = undefined;
        if (requestSchemaIdResponse != null) {
            const required = this.isSchemaRequired(requestSchemaIdResponse.schema);
            requestExample = this.exampleTypeFactory.buildExample({
                schema: requestSchemaIdResponse.schema,
                example: requestSchemaIdResponse.example?.value,
                isOptional: !required,
                parameter: false
            });
            if (required && requestExample == null) {
                return undefined;
            }
        }

        let responseExample = undefined;
        if (responseSchemaIdResponse != null) {
            const required = this.isSchemaRequired(responseSchemaIdResponse.schema);
            responseExample = this.exampleTypeFactory.buildExample({
                schema: responseSchemaIdResponse.schema,
                example: responseSchemaIdResponse.example?.value,
                isOptional: !required,
                parameter: false
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
                isOptional: !required,
                example: undefined,
                parameter: true
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
                isOptional: !required,
                example: undefined,
                parameter: true
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
                isOptional: !required,
                example: undefined,
                parameter: true
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

        const example = {
            pathParameters,
            queryParameters,
            headers,
            request: requestExample,
            response: responseExample,
            codeSamples: endpoint.customCodeSamples,
        };

        return example;
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
    if (request.type !== "json") {
        return { type: "unsupported" };
    }
    return { type: "present", schema: request.schema, example: request.fullExamples?.[0] ?? undefined };
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

function isExamplePrimitive(example: FullExample): boolean {
    switch (example.type) {
        case "primitive":
        case "enum":
        case "literal":
            return true;
        case "unknown":
            return isExamplePrimitive(example.unknown);
        case "array":
        case "object":
        case "map":
            return false;
        case "oneOf":
            switch (example.oneOf.type) {
                case "discriminated":
                    return false;
                case "undisciminated":
                    return isExamplePrimitive(example.oneOf.undisciminated);
                default:
                    return false;
            }
        default:
            assertNever(example);
    }
}
