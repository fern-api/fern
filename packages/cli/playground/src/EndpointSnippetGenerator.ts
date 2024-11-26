import { dynamic } from "@fern-api/dynamic-ir-sdk/api";
import { Request } from "./Request";
import { AbstractDynamicSnippetsGenerator } from "./core/AbstractDynamicSnippetsGenerator";
import { AbstractDynamicSnippetsGeneratorContext } from "./core/AbstractDynamicSnippetsGeneratorContext";

export class EndpointSnippetGenerator {
    private generator: AbstractDynamicSnippetsGenerator<AbstractDynamicSnippetsGeneratorContext>;
    private endpoint: dynamic.Endpoint;

    constructor({
        generator,
        endpoint
    }: {
        generator: AbstractDynamicSnippetsGenerator<AbstractDynamicSnippetsGeneratorContext>;
        endpoint: dynamic.Endpoint;
    }) {
        this.generator = generator;
        this.endpoint = endpoint;
    }

    public async generate(request: Request): Promise<dynamic.EndpointSnippetResponse> {
        return this.generator.generate({
            endpoint: this.endpoint.location,
            auth: request.auth,
            pathParameters: request.pathParameters,
            queryParameters: request.queryParameters,
            headers: request.headers,
            requestBody: request.requestBody
        });
    }
}
