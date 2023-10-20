import {
    EndpointExample,
    HeaderExample,
    PathParameterExample,
    QueryParameterExample,
    Request,
    Response,
} from "@fern-fern/openapi-ir-model/finalIr";
import { EndpointWithExample, SchemaWithExample } from "@fern-fern/openapi-ir-model/parseIr";
import { isSchemaRequired } from "../../utils/isSchemaRequrired";
import { DummyExampleFactory } from "./DummyExampleFactory";
import { ExampleTypeFactory } from "./ExampleTypeFactory";

export class ExampleEndpointFactory {
    private exampleTypeFactory: ExampleTypeFactory;
    private dummyExampleFactory: DummyExampleFactory;

    constructor(schemas: Record<string, SchemaWithExample>) {
        this.exampleTypeFactory = new ExampleTypeFactory(schemas);
        this.dummyExampleFactory = new DummyExampleFactory(schemas);
    }

    public buildEndpointExample(endpoint: EndpointWithExample): EndpointExample | undefined {
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

        const pathParameters: PathParameterExample[] = [];
        const headers: HeaderExample[] = [];
        const queryParameters: QueryParameterExample[] = [];

        for (const pathParameter of endpoint.pathParameters) {
            const example = this.exampleTypeFactory.buildExample(pathParameter.schema);
            if (example != null) {
                pathParameters.push({
                    name: pathParameter.name,
                    value: example,
                });
            } else if (isSchemaRequired(pathParameter.schema)) {
                const dummyExample = this.dummyExampleFactory.generateExample({
                    schema: pathParameter.schema,
                    name: pathParameter.name,
                });
                if (dummyExample == null) {
                    return;
                }
                pathParameters.push({
                    name: pathParameter.name,
                    value: dummyExample,
                });
            }
        }

        for (const queryParameter of endpoint.queryParameters) {
            const example = this.exampleTypeFactory.buildExample(queryParameter.schema);
            if (example != null) {
                queryParameters.push({
                    name: queryParameter.name,
                    value: example,
                });
            } else if (isSchemaRequired(queryParameter.schema)) {
                const dummyExample = this.dummyExampleFactory.generateExample({
                    schema: queryParameter.schema,
                    name: queryParameter.name,
                });
                if (dummyExample == null) {
                    return;
                }
                pathParameters.push({
                    name: queryParameter.name,
                    value: dummyExample,
                });
            }
        }

        for (const header of endpoint.headers) {
            const example = this.exampleTypeFactory.buildExample(header.schema);
            if (example != null) {
                headers.push({
                    name: header.name,
                    value: example,
                });
            } else if (isSchemaRequired(header.schema)) {
                const dummyExample = this.dummyExampleFactory.generateExample({
                    schema: header.schema,
                    name: header.name,
                });
                if (dummyExample == null) {
                    return;
                }
                pathParameters.push({
                    name: header.name,
                    value: dummyExample,
                });
            }
        }

        return {
            pathParameters,
            queryParameters,
            headers,
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
