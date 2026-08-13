import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbstractAstNode } from "../ast/index.js";
import { AbstractDynamicSnippetsGeneratorContext } from "./AbstractDynamicSnippetsGeneratorContext.js";
import { AbstractEndpointSnippetGenerator } from "./AbstractEndpointSnippetGenerator.js";
import { InvocationSnippetResponse } from "./InvocationSnippetResponse.js";
import { Options } from "./Options.js";
import { Result } from "./Result.js";

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
        const endpoints = this.resolveEndpoints({ request, options });
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
        const endpoints = this.resolveEndpoints({ request, options });
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
        throw new Error(
            `Failed to generate snippet AST for endpoint: ${request.endpoint.method} ${request.endpoint.path}`
        );
    }

    public generateSync(
        request: FernIr.dynamic.EndpointSnippetRequest,
        options: Options = {}
    ): FernIr.dynamic.EndpointSnippetResponse {
        const endpoints = this.resolveEndpoints({ request, options });
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

    /**
     * Generates the structured pieces of an endpoint invocation for callers that render the
     * invocation within code of their own (e.g. a documentation code template): the bare call
     * (e.g. `client.plants.update(...)`), the imports the call requires, and the generated
     * client class/type name.
     *
     * Returns undefined only if this generator does not support invocation-only snippets, so
     * that callers can fall back to the complete snippet. This is the capability check the
     * multi-language fan-out relies on. When the generator does support them, invocations that
     * reference imported SDK types (e.g. branded string aliases) return those imports in the
     * `imports` field rather than bailing out.
     */
    public generateInvocationSync(
        request: FernIr.dynamic.EndpointSnippetRequest,
        options: Options = {}
    ): InvocationSnippetResponse | undefined {
        const endpoints = this.resolveEndpoints({ request, options });
        if (endpoints.length === 0) {
            throw new Error(`No endpoints found that match "${request.endpoint.method} ${request.endpoint.path}"`);
        }
        let bestResponse: InvocationSnippetResponse | undefined = undefined;
        let lastError: Error | undefined = undefined;
        for (const endpoint of endpoints) {
            const context = this.context.clone() as Context;
            const snippetGenerator = this.createSnippetGenerator(context);
            if (snippetGenerator.generateInvocationSnippetSync == null) {
                return undefined;
            }
            try {
                const response = snippetGenerator.generateInvocationSnippetSync({ endpoint, request, options });
                if (response == null) {
                    return undefined;
                }
                if (context.errors.empty()) {
                    return response;
                }
                if (this.shouldUpdateInvocationResponse({ candidate: response, current: bestResponse })) {
                    bestResponse = response;
                }
            } catch (error) {
                if (lastError == null) {
                    lastError = error as Error;
                }
            }
        }
        if (bestResponse != null) {
            return bestResponse;
        }
        throw (
            lastError ??
            new Error(`Failed to generate snippet for endpoint "${request.endpoint.method} ${request.endpoint.path}"`)
        );
    }

    private shouldUpdateInvocationResponse({
        candidate,
        current
    }: {
        candidate: InvocationSnippetResponse;
        current: InvocationSnippetResponse | undefined;
    }): boolean {
        if (current == null) {
            return true;
        }
        return candidate.snippet.length > current.snippet.length;
    }

    /**
     * Resolves endpoints based on the request and options.
     * If an endpointId is specified in options, returns only that specific endpoint.
     * Otherwise, resolves all endpoints matching the endpoint location (method + path).
     */
    private resolveEndpoints({
        request,
        options
    }: {
        request: FernIr.dynamic.EndpointSnippetRequest;
        options: Options;
    }): FernIr.dynamic.Endpoint[] {
        if (options.endpointId != null) {
            const endpoint = this.context.resolveEndpointById(options.endpointId);
            if (endpoint == null) {
                throw new Error(`No endpoint found with ID "${options.endpointId}"`);
            }
            return [endpoint];
        }
        return this.context.resolveEndpointLocationOrThrow(request.endpoint);
    }
}
