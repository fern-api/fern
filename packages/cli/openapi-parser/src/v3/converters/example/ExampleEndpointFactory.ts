import {
    EndpointExample,
    HeaderExample,
    PathParameterExample,
    QueryParameterExample,
    Request,
    Response,
} from "@fern-fern/openapi-ir-model/finalIr";
import {
    EndpointWithExample,
    HeaderWithExample,
    PathParameterWithExample,
    QueryParameterWithExample,
    SchemaWithExample,
} from "@fern-fern/openapi-ir-model/parseIr";
import { isSchemaRequired } from "../../utils/isSchemaRequrired";
import { DummyExampleFactory } from "./DummyExampleFactory";
import { ExampleTypeFactory } from "./ExampleTypeFactory";

type GeneratedParamterExample = SuccessfullyGeneratedParamterExample | FailedGeneratedParamterExample;

interface SuccessfullyGeneratedParamterExample {
    type: "success";
    value: QueryParameterExample | HeaderExample | PathParameterExample | undefined;
}

interface FailedGeneratedParamterExample {
    type: "failed";
}

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

        let requestExample = undefined;
        if (requestSchemaIdResponse != null) {
            requestExample = this.exampleTypeFactory.buildExampleFromSchemaId(requestSchemaIdResponse.schemaId);
            if (requestExample == null) {
                return undefined;
            }
        }

        let responseExample = undefined;
        if (responseSchemaIdResponse != null) {
            responseExample = this.exampleTypeFactory.buildExampleFromSchemaId(responseSchemaIdResponse.schemaId);
            if (responseExample == null) {
                return undefined;
            }
        }

        const pathParameters: PathParameterExample[] = [];
        for (const pathParameter of endpoint.pathParameters) {
            const example = this.buildParameterExample(pathParameter);
            if (example.type === "failed") {
                return;
            } else if (example.value != null) {
                pathParameters.push(example.value);
            }
        }

        const queryParameters: QueryParameterExample[] = [];
        for (const queryParameter of endpoint.queryParameters) {
            const example = this.buildParameterExample(queryParameter);
            if (example.type === "failed") {
                return;
            } else if (example.value != null) {
                queryParameters.push(example.value);
            }
        }

        const headers: HeaderExample[] = [];
        for (const header of endpoint.headers) {
            const example = this.buildParameterExample(header);
            if (example.type === "failed") {
                return;
            } else if (example.value != null) {
                headers.push(example.value);
            }
        }

        const example = {
            pathParameters,
            queryParameters,
            headers,
            request: requestExample,
            response: responseExample,
        };

        return example;
    }

    private buildParameterExample(
        parameter: QueryParameterWithExample | PathParameterWithExample | HeaderWithExample
    ): GeneratedParamterExample {
        const example = this.exampleTypeFactory.buildExample(parameter.schema);
        if (example != null) {
            return {
                type: "success",
                value: {
                    name: parameter.name,
                    value: example,
                },
            };
        } else if (isSchemaRequired(parameter.schema) && parameter.schema.type === "primitive") {
            const dummyExample = this.dummyExampleFactory.generateExample({
                schema: parameter.schema,
                name: parameter.name,
            });
            if (dummyExample == null) {
                return { type: "failed" };
            }
            return {
                type: "success",
                value: {
                    name: parameter.name,
                    value: dummyExample,
                },
            };
        }
        return { type: "failed" };
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
    return request.schema.type === "reference"
        ? { type: "present", schemaId: request.schema.schema }
        : { type: "unsupported" };
}

function getSchemaIdFromResponse(response: Response | null | undefined): SchemaIdResponse | undefined {
    if (response == null) {
        return undefined;
    }
    if (response.type !== "json") {
        return { type: "unsupported" };
    }
    return response.schema.type === "reference"
        ? { type: "present", schemaId: response.schema.schema }
        : { type: "unsupported" };
}
