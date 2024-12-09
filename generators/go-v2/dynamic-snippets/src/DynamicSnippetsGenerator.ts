import {
    AbstractDynamicSnippetsGenerator,
    AbstractFormatter,
    FernGeneratorExec
} from "@fern-api/browser-compatible-base-generator";
import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";
import { dynamic as DynamicSnippets } from "@fern-fern/ir-sdk/api";
import { EndpointSnippetGenerator } from "./EndpointSnippetGenerator";
import { Result } from "./Result";

export class DynamicSnippetsGenerator extends AbstractDynamicSnippetsGenerator<
    DynamicSnippets.DynamicIntermediateRepresentation,
    DynamicSnippetsGeneratorContext,
    DynamicSnippets.EndpointSnippetRequest,
    DynamicSnippets.EndpointSnippetResponse
> {
    private formatter: AbstractFormatter | undefined;

    constructor({
        ir,
        config,
        formatter
    }: {
        ir: DynamicSnippets.DynamicIntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
        formatter?: AbstractFormatter;
    }) {
        super(new DynamicSnippetsGeneratorContext({ ir, config }));
        this.formatter = formatter;
    }

    public async generate(
        request: DynamicSnippets.EndpointSnippetRequest
    ): Promise<DynamicSnippets.EndpointSnippetResponse> {
        const endpoints = this.context.resolveEndpointLocationOrThrow(request.endpoint);
        if (endpoints.length === 0) {
            throw new Error(`No endpoints found that match "${request.endpoint.method} ${request.endpoint.path}"`);
        }
        const result = new Result();
        for (const endpoint of endpoints) {
            const context = this.context.clone();
            const snippetGenerator = new EndpointSnippetGenerator({
                context,
                formatter: this.formatter
            });
            try {
                const snippet = await snippetGenerator.generateSnippet({ endpoint, request });
                if (context.errors.empty()) {
                    return {
                        snippet,
                        errors: undefined
                    };
                }
                result.update({ context, snippet });
            } catch (error) {
                if (result.err == null) {
                    result.err = error as Error;
                }
            }
        }
        return result.getResponseOrThrow({ endpoint: request.endpoint });
    }

    public generateSync(
        request: DynamicSnippets.EndpointSnippetRequest
    ): DynamicSnippets.EndpointSnippetResponse {
        const endpoints = this.context.resolveEndpointLocationOrThrow(request.endpoint);
        if (endpoints.length === 0) {
            throw new Error(`No endpoints found that match "${request.endpoint.method} ${request.endpoint.path}"`);
        }
        const result = new Result();
        for (const endpoint of endpoints) {
            const context = this.context.clone();
            const snippetGenerator = new EndpointSnippetGenerator({
                context,
                formatter: this.formatter
            });
            try {
                const snippet = snippetGenerator.generateSnippetSync({ endpoint, request });
                if (context.errors.empty()) {
                    return {
                        snippet,
                        errors: undefined
                    };
                }
                result.update({ context, snippet });
            } catch (error) {
                if (result.err == null) {
                    result.err = error as Error;
                }
            }
        }
        return result.getResponseOrThrow({ endpoint: request.endpoint });
    }
}