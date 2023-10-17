import { Logger } from "@fern-api/logger";
import { Endpoint, EndpointExample, Request, Response } from "@fern-fern/openapi-ir-model/ir";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { ExampleTypeFactory } from "./ExampleTypeFactory";

export class ExampleEndpointFactory {
    private logger: Logger;
    private exampleTypeFactory: ExampleTypeFactory;

    constructor(context: AbstractOpenAPIV3ParserContext) {
        this.logger = context.logger;
        this.exampleTypeFactory = new ExampleTypeFactory(context);
    }

    public buildEndpointExample(endpoint: Omit<Endpoint, "examples">): EndpointExample | undefined {
        this.logger.info(`Constructing example for endpoint ${endpoint.method.toUpperCase()} ${endpoint.path}`);

        const requestSchemaIdResponse = getSchemaIdFromRequest(endpoint.request);
        const responseSchemaIdResponse = getSchemaIdFromResponse(endpoint.response);

        if (requestSchemaIdResponse?.type === "unsupported" || responseSchemaIdResponse?.type === "unsupported") {
            this.logger.info("The request or response is unsupported!");
            return undefined;
        }

        const requestExample =
            requestSchemaIdResponse != null
                ? this.exampleTypeFactory.buildExample(requestSchemaIdResponse.schemaInstanceId)
                : undefined;
        const responseExample =
            responseSchemaIdResponse != null
                ? this.exampleTypeFactory.buildExample(responseSchemaIdResponse.schemaInstanceId)
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

type SchemaIdResponse = { type: "present"; schemaInstanceId: string } | { type: "unsupported" };

function getSchemaIdFromRequest(request: Request | null | undefined): SchemaIdResponse | undefined {
    if (request == null) {
        return undefined;
    }
    if (request.type !== "json") {
        return { type: "unsupported" };
    }
    const schemaInstanceId = request.schema.type === "reference" ? request.schema.schema : request.schemaInstanceId;
    return { type: "present", schemaInstanceId };
}

function getSchemaIdFromResponse(response: Response | null | undefined): SchemaIdResponse | undefined {
    if (response == null) {
        return undefined;
    }
    if (response.type !== "json") {
        return { type: "unsupported" };
    }
    return response.schema.type === "reference"
        ? { type: "present", schemaInstanceId: response.schema.schema }
        : undefined;
}
