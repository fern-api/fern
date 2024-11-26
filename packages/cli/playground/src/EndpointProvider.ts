import { dynamic as DynamicSnippets } from "@fern-api/dynamic-ir-sdk/api";
import { AbstractDynamicSnippetsGenerator } from "./core/AbstractDynamicSnippetsGenerator";
import { AbstractDynamicSnippetsGeneratorContext } from "./core/AbstractDynamicSnippetsGeneratorContext";
import { HttpEndpointReferenceParser } from "./core/HttpEndpointReferenceParser";
import { Endpoint } from "./Endpoint";
import { EndpointSnippetGenerator } from "./EndpointSnippetGenerator";

export class EndpointProvider {
    private ir: DynamicSnippets.DynamicIntermediateRepresentation;
    private generator: AbstractDynamicSnippetsGenerator<AbstractDynamicSnippetsGeneratorContext>;
    private httpEndpointReferenceParser: HttpEndpointReferenceParser;

    constructor({
        ir,
        generator
    }: {
        ir: DynamicSnippets.DynamicIntermediateRepresentation;
        generator: AbstractDynamicSnippetsGenerator<AbstractDynamicSnippetsGeneratorContext>;
    }) {
        this.ir = ir;
        this.generator = generator;
        this.httpEndpointReferenceParser = new HttpEndpointReferenceParser();
    }

    public endpoint(endpoint: Endpoint): EndpointSnippetGenerator {
        const resolvedEndpoint = this.resolveEndpointOrThrow(endpoint);
        return new EndpointSnippetGenerator({ generator: this.generator, endpoint: resolvedEndpoint });
    }

    private resolveEndpointOrThrow(endpoint: string): DynamicSnippets.Endpoint {
        const parsedEndpoint = this.httpEndpointReferenceParser.tryParse(endpoint);
        if (parsedEndpoint == null) {
            throw new Error(`Invalid endpoint reference: "${endpoint}"`);
        }
        return this.resolveEndpointLocationOrThrow(parsedEndpoint);
    }

    private resolveEndpointLocationOrThrow(location: DynamicSnippets.EndpointLocation): DynamicSnippets.Endpoint {
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
        endpoint: DynamicSnippets.Endpoint;
        parsedEndpoint: HttpEndpointReferenceParser.Parsed;
    }): boolean {
        return endpoint.location.method === parsedEndpoint.method && endpoint.location.path === parsedEndpoint.path;
    }
}
