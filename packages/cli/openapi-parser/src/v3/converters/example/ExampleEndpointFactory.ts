import { Endpoint, EndpointExample } from "@fern-fern/openapi-ir-model/ir";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { ExampleTypeFactory } from "./ExampleTypeFactory";

export class ExampleEndpointFactory {
    private exampleTypeFactory: ExampleTypeFactory;

    constructor(context: AbstractOpenAPIV3ParserContext) {
        this.exampleTypeFactory = new ExampleTypeFactory(context);
    }

    public buildEndpointExample(endpoint: Omit<Endpoint, "examples">): EndpointExample | undefined {
        // eslint-disable-next-line no-console
        console.log(`Creating examples for endpoint ${endpoint.operationId}`);
        if (endpoint.request?.type === "json") {
            const requestSchemaId =
                endpoint.request.schema.type === "reference"
                    ? endpoint.request.schema.schema
                    : endpoint.request.schemaInstanceId;
            const requestExample = this.exampleTypeFactory.buildExample(requestSchemaId);
            if (requestExample != null) {
                return {
                    pathParameters: [],
                    queryParameters: [],
                    headers: [],
                    request: requestExample,
                    response: undefined,
                };
            }
        }
        // eslint-disable-next-line no-console
        console.log(`Found no examples for ${endpoint.operationId}`);
        return undefined;
    }
}
