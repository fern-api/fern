import { FernIr } from "@fern-api/dynamic-ir-sdk";

import { AbstractDynamicSnippetsGeneratorContext } from "./AbstractDynamicSnippetsGeneratorContext";
import { AbstractEndpointSnippetGenerator } from "./AbstractEndpointSnippetGenerator";
import { Options } from "./Options";
import { Result } from "./Result";
import { AbstractAstNode } from "../ast";

export abstract class AbstractDynamicSnippetsGenerator<
    Context extends AbstractDynamicSnippetsGeneratorContext,
    EndpointSnippetGenerator extends AbstractEndpointSnippetGenerator<Context>
> {
    public constructor(public readonly context: Context) {}

    protected abstract createSnippetGenerator(context: Context): EndpointSnippetGenerator;

    public async generate(
        request: FernIr.dynamic.EndpointSnippetRequest,
        options: Options = {}
    ): Promise<FernIr.dynamic.EndpointSnippetResponse> {
        const endpoints = this.context.resolveEndpointLocationOrThrow(request.endpoint);
        if (endpoints.length === 0) {
            throw new Error(`No endpoints found that match "${request.endpoint.method} ${request.endpoint.path}"`);
        }
        const result = new Result();
        for (const endpoint of endpoints) {
            const context = this.context.clone() as Context;
            const snippetGenerator = this.createSnippetGenerator(context);
            try {
                const snippet = await snippetGenerator.generateSnippet({ endpoint, request, options });
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

    public async generateSnippetAst(
        request: FernIr.dynamic.EndpointSnippetRequest,
        options: Options = {}
    ): Promise<AbstractAstNode> {
        const endpoints = this.context.resolveEndpointLocationOrThrow(request.endpoint);
        if (endpoints.length === 0) {
            throw new Error(`No endpoints found that match "${request.endpoint.method} ${request.endpoint.path}"`);
        }
        let lastError: Error | undefined = undefined;
        for (const endpoint of endpoints) {
            const context = this.context.clone() as Context;
            const snippetGenerator = this.createSnippetGenerator(context);
            try {
                const ast = await snippetGenerator.generateSnippetAst({ endpoint, request, options });
                return ast;
            } catch (error) {
                lastError = error as Error;
            }
        }
        if (lastError != null) {
            throw lastError;
        }
        throw new Error(`Failed to generate snippet AST for endpoint: ${request.endpoint.method} ${request.endpoint.path}`);
    }

    public generateSync(
        request: FernIr.dynamic.EndpointSnippetRequest,
        options: Options = {}
    ): FernIr.dynamic.EndpointSnippetResponse {
        const endpoints = this.context.resolveEndpointLocationOrThrow(request.endpoint);
        if (endpoints.length === 0) {
            throw new Error(`No endpoints found that match "${request.endpoint.method} ${request.endpoint.path}"`);
        }
        const result = new Result();
        for (const endpoint of endpoints) {
            const context = this.context.clone() as Context;
            const snippetGenerator = this.createSnippetGenerator(context);
            try {
                const snippet = snippetGenerator.generateSnippetSync({ endpoint, request, options });
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
