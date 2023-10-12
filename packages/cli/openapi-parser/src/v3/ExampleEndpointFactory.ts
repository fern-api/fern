import { Endpoint, EndpointExample } from "@fern-fern/openapi-ir-model/ir";
import { AbstractOpenAPIV3ParserContext } from "./AbstractOpenAPIV3ParserContext";
import { ExampleTypeFactory } from "./ExampleTypeFactory";

export class ExampleEndpointFactory {
    private context: AbstractOpenAPIV3ParserContext;
    private exampleTypeFactory: ExampleTypeFactory;

    constructor(context: AbstractOpenAPIV3ParserContext, exampleTypeFactory: ExampleTypeFactory) {
        this.context = context;
        this.exampleTypeFactory = exampleTypeFactory;
    }

    public buildEndpointExample(_endpoint: Omit<Endpoint, "examples">): EndpointExample {
        // TODO: Build out an example by referencing the IDs assocaited with the
        //       endpoint's path parameters, query parameters, etc, and calling
        //       the ExampleTypeFactory.
        return {
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            request: undefined,
            response: undefined,
        };
    }
}
