import { Logger } from "@fern-api/logger";
import {
    EndpointExample,
    HeaderExample,
    PathParameterExample,
    QueryParameterExample
} from "@fern-fern/openapi-ir-model/finalIr";
import {
    EndpointWithExample,
    HeaderWithExample,
    PathParameterWithExample,
    QueryParameterWithExample,
    RequestWithExample,
    ResponseWithExample,
    SchemaWithExample
} from "@fern-fern/openapi-ir-model/parseIr";
import { isSchemaRequired } from "../../utils/isSchemaRequired";
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
    private logger: Logger;

    constructor(schemas: Record<string, SchemaWithExample>, logger: Logger) {
        this.exampleTypeFactory = new ExampleTypeFactory(schemas);
        this.dummyExampleFactory = new DummyExampleFactory(schemas);
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
            requestExample = this.exampleTypeFactory.buildExample(requestSchemaIdResponse.schema, undefined);
            if (requestExample == null) {
                this.logger.debug(
                    `Not enough information to generate request example for ${endpoint.method.toUpperCase()} ${
                        endpoint.path
                    }. Skipping example.`
                );
                return undefined;
            }
        }

        let responseExample = undefined;
        if (responseSchemaIdResponse != null) {
            responseExample = this.exampleTypeFactory.buildExample(responseSchemaIdResponse.schema, undefined);
            if (responseExample == null) {
                this.logger.debug(
                    `Not enough information to generate response example for ${endpoint.method.toUpperCase()} ${
                        endpoint.path
                    }. Skipping example.`
                );
                return undefined;
            }
        }

        const pathParameters: PathParameterExample[] = [];
        for (const pathParameter of endpoint.pathParameters) {
            const example = this.buildParameterExample(pathParameter);
            if (example.type === "failed") {
                this.logger.debug(
                    `Failed to generate example for path parameter ${
                        pathParameter.name
                    } in ${endpoint.method.toUpperCase()} ${endpoint.path}. Skipping example.`
                );
                return;
            } else if (example.value != null) {
                pathParameters.push(example.value);
            }
        }

        const queryParameters: QueryParameterExample[] = [];
        for (const queryParameter of endpoint.queryParameters) {
            const example = this.buildParameterExample(queryParameter);
            if (example.type === "failed") {
                this.logger.debug(
                    `Failed to generate example for query parameter ${
                        queryParameter.name
                    } in ${endpoint.method.toUpperCase()} ${endpoint.path}. Skipping example.`
                );
                return;
            } else if (example.value != null) {
                queryParameters.push(example.value);
            }
        }

        const headers: HeaderExample[] = [];
        for (const header of endpoint.headers) {
            const example = this.buildParameterExample(header);
            if (example.type === "failed") {
                this.logger.debug(
                    `Failed to generate example for header ${header.name} in ${endpoint.method.toUpperCase()} ${
                        endpoint.path
                    }. Skipping example.`
                );
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
            response: responseExample
        };

        return example;
    }

    private buildParameterExample(
        parameter: QueryParameterWithExample | PathParameterWithExample | HeaderWithExample
    ): GeneratedParamterExample {
        const isRequired = isSchemaRequired(parameter.schema);
        const example = this.exampleTypeFactory.buildExample(parameter.schema, undefined);
        if (example != null) {
            return {
                type: "success",
                value: {
                    name: parameter.name,
                    value: example
                }
            };
        } else if (isRequired) {
            const dummyExample = this.dummyExampleFactory.generateExample({
                schema: parameter.schema,
                name: parameter.name
            });
            if (dummyExample == null) {
                return { type: "failed" };
            }
            return {
                type: "success",
                value: {
                    name: parameter.name,
                    value: dummyExample
                }
            };
        }
        return { type: "success", value: undefined };
    }
}

type SchemaIdResponse = { type: "present"; schema: SchemaWithExample } | { type: "unsupported" };

function getRequestSchema(request: RequestWithExample | null | undefined): SchemaIdResponse | undefined {
    if (request == null) {
        return undefined;
    }
    if (request.type !== "json") {
        return { type: "unsupported" };
    }
    return { type: "present", schema: request.schema };
}

function getResponseSchema(response: ResponseWithExample | null | undefined): SchemaIdResponse | undefined {
    if (response == null) {
        return undefined;
    }
    if (response.type !== "json") {
        return { type: "unsupported" };
    }
    return { type: "present", schema: response.schema };
}
