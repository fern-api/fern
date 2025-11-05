import { ErrorReporter } from "./ErrorReporter";
import { Options } from "./Options";
import { Result } from "./Result";
import {
    DynamicSnippetsGeneratorContextLike,
    EndpointLike,
    EndpointSnippetGeneratorLike,
    EndpointSnippetRequestLike,
    EndpointSnippetResponseLike
} from "./types";

export abstract class AbstractDynamicSnippetsGenerator<
    Context extends DynamicSnippetsGeneratorContextLike<EndpointT>,
    EndpointSnippetGenerator extends EndpointSnippetGeneratorLike<Context, EndpointT, RequestT>,
    EndpointT extends EndpointLike = EndpointLike,
    RequestT extends EndpointSnippetRequestLike = EndpointSnippetRequestLike,
    ResponseT extends EndpointSnippetResponseLike = EndpointSnippetResponseLike
> {
    public constructor(public readonly context: Context) {}

    protected abstract createSnippetGenerator(context: Context): EndpointSnippetGenerator;

    /**
     * Adapter hook to convert EndpointSnippetResponseLike to the generic ResponseT.
     * Subclasses can override this if they need to adapt to a richer response shape.
     */
    protected toResponse(value: EndpointSnippetResponseLike): ResponseT {
        return value as unknown as ResponseT;
    }

    public async generate(request: RequestT, options: Options = {}): Promise<ResponseT> {
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
                    return this.toResponse({
                        snippet,
                        errors: undefined
                    });
                }
                result.update({ context: context as unknown as { errors: ErrorReporter }, snippet });
            } catch (error) {
                if (result.err == null) {
                    result.err = error as Error;
                }
            }
        }
        return this.toResponse(result.getResponseOrThrow({ endpoint: request.endpoint }));
    }

    public generateSync(request: RequestT, options: Options = {}): ResponseT {
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
                    return this.toResponse({
                        snippet,
                        errors: undefined
                    });
                }
                result.update({ context: context as unknown as { errors: ErrorReporter }, snippet });
            } catch (error) {
                if (result.err == null) {
                    result.err = error as Error;
                }
            }
        }
        return this.toResponse(result.getResponseOrThrow({ endpoint: request.endpoint }));
    }
}
