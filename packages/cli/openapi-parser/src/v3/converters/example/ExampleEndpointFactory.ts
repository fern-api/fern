import { Endpoint, EndpointExample, Request, Response } from "@fern-fern/openapi-ir-model/finalIr";
import { SchemaWithExample } from "@fern-fern/openapi-ir-model/parseIr";
import { ExampleTypeFactory } from "./ExampleTypeFactory";

export class ExampleEndpointFactory {
    private exampleTypeFactory: ExampleTypeFactory;

    constructor(schemas: Record<string, SchemaWithExample>) {
        this.exampleTypeFactory = new ExampleTypeFactory(schemas);
    }

    public buildEndpointExample(endpoint: Omit<Endpoint, "examples">): EndpointExample | undefined {
        const requestSchemaIdResponse = getSchemaIdFromRequest(endpoint.request);
        const responseSchemaIdResponse = getSchemaIdFromResponse(endpoint.response);

        if (requestSchemaIdResponse?.type === "unsupported" || responseSchemaIdResponse?.type === "unsupported") {
            return undefined;
        }

        const requestExample =
            requestSchemaIdResponse != null
                ? this.exampleTypeFactory.buildExampleFromSchemaId(requestSchemaIdResponse.schemaId)
                : undefined;
        const responseExample =
            responseSchemaIdResponse != null
                ? this.exampleTypeFactory.buildExampleFromSchemaId(responseSchemaIdResponse.schemaId)
                : undefined;
        if (requestExample === undefined && responseExample === undefined) {
            return undefined;
        }

        return {
            pathParameters: [],
            queryParameters: [],
            headers: [],
            request: requestExample,
            response: responseExample,
        };
    }
}

type SchemaIdResponse = { type: "present"; schemaId: string } | { type: "unsupported" };

function getSchemaIdFromRequest(request: Request | null | undefined): SchemaIdResponse | undefined {
    if (request == null) {
        return undefined;
    }
    if (request.type !== "json") {
        return { type: "unsupported" };
    }
    return request.schema.type === "reference" ? { type: "present", schemaId: request.schema.schema } : undefined;
}

function getSchemaIdFromResponse(response: Response | null | undefined): SchemaIdResponse | undefined {
    if (response == null) {
        return undefined;
    }
    if (response.type !== "json") {
        return { type: "unsupported" };
    }
    return response.schema.type === "reference" ? { type: "present", schemaId: response.schema.schema } : undefined;
}
