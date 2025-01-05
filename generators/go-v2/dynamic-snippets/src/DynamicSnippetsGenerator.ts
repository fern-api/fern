import {
    AbstractDynamicSnippetsGenerator,
    AbstractFormatter,
    FernGeneratorExec,
    Result
} from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";

import { EndpointSnippetGenerator } from "./EndpointSnippetGenerator";
import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";

export class DynamicSnippetsGenerator extends AbstractDynamicSnippetsGenerator<
    DynamicSnippetsGeneratorContext,
    FernIr.dynamic.EndpointSnippetRequest,
    FernIr.dynamic.EndpointSnippetResponse
> {
    private formatter: AbstractFormatter | undefined;

    constructor({
        ir,
        config,
        formatter
    }: {
        ir: FernIr.dynamic.DynamicIntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
        formatter?: AbstractFormatter;
    }) {
        super(new DynamicSnippetsGeneratorContext({ ir, config }));
        this.formatter = formatter;
    }

    public async generate(
        request: FernIr.dynamic.EndpointSnippetRequest
    ): Promise<FernIr.dynamic.EndpointSnippetResponse> {
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

    public generateSync(request: FernIr.dynamic.EndpointSnippetRequest): FernIr.dynamic.EndpointSnippetResponse {
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
