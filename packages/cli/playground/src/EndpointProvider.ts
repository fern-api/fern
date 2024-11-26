import { dynamic } from "@fern-api/dynamic-ir-sdk/api";
import { AbstractDynamicSnippetsGenerator } from "./core/AbstractDynamicSnippetsGenerator";
import { AbstractDynamicSnippetsGeneratorContext } from "./core/AbstractDynamicSnippetsGeneratorContext";
import { HttpEndpointReferenceParser } from "./core/HttpEndpointReferenceParser";
import { Endpoint } from "./Endpoint";
import { EndpointSnippetGenerator } from "./EndpointSnippetGenerator";

export class EndpointProvider {
    private ir: dynamic.DynamicIntermediateRepresentation;
    private generator: AbstractDynamicSnippetsGenerator<
        dynamic.DynamicIntermediateRepresentation,
        AbstractDynamicSnippetsGeneratorContext<dynamic.DynamicIntermediateRepresentation>,
        dynamic.EndpointSnippetRequest,
        dynamic.EndpointSnippetResponse
    >;
    private httpEndpointReferenceParser: HttpEndpointReferenceParser;

    constructor({
        ir,
        generator
    }: {
        ir: dynamic.DynamicIntermediateRepresentation;
        generator: AbstractDynamicSnippetsGenerator<
            dynamic.DynamicIntermediateRepresentation,
            AbstractDynamicSnippetsGeneratorContext<dynamic.DynamicIntermediateRepresentation>,
            dynamic.EndpointSnippetRequest,
            dynamic.EndpointSnippetResponse
        >;
    }) {
        this.ir = ir;
        this.generator = generator;
        this.httpEndpointReferenceParser = new HttpEndpointReferenceParser();
    }

    public endpoint(endpoint: Endpoint): EndpointSnippetGenerator {
        const resolvedEndpoint = this.resolveEndpointOrThrow(endpoint);
        return new EndpointSnippetGenerator({ generator: this.generator, endpoint: resolvedEndpoint });
    }

    private resolveEndpointOrThrow(endpoint: string): dynamic.Endpoint {
        const parsedEndpoint = this.httpEndpointReferenceParser.tryParse(endpoint);
        if (parsedEndpoint == null) {
            throw new Error(`Invalid endpoint reference: "${endpoint}"`);
        }
        return this.resolveEndpointLocationOrThrow(parsedEndpoint);
    }

    private resolveEndpointLocationOrThrow(location: dynamic.EndpointLocation): dynamic.Endpoint {
        for (const endpoint of Object.values(this.ir.endpoints)) {
            if (this.parsedEndpointMatches({ endpoint, parsedEndpoint: location })) {
                return endpoint;
            }
        }
        throw new Error(`Failed to find endpoint identified by "${JSON.stringify(location)}"`);
    }

    private parsedEndpointMatches({
        endpoint,
        parsedEndpoint
    }: {
        endpoint: dynamic.Endpoint;
        parsedEndpoint: HttpEndpointReferenceParser.Parsed;
    }): boolean {
        return endpoint.location.method === parsedEndpoint.method && endpoint.location.path === parsedEndpoint.path;
    }
}
