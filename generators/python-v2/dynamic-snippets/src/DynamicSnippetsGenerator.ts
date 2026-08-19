import {
    AbstractAstNode,
    AbstractDynamicSnippetsGenerator,
    FernGeneratorExec,
    Options
} from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { python } from "@fern-api/python-ast";
import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext.js";
import { EndpointSnippetGenerator } from "./EndpointSnippetGenerator.js";

export class DynamicSnippetsGenerator extends AbstractDynamicSnippetsGenerator<
    DynamicSnippetsGeneratorContext,
    EndpointSnippetGenerator
> {
    constructor({
        ir,
        config
    }: {
        ir: FernIr.dynamic.DynamicIntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
    }) {
        super(new DynamicSnippetsGeneratorContext({ ir, config }));
    }

    public async generate(
        request: FernIr.dynamic.EndpointSnippetRequest,
        options: Options = {}
    ): Promise<FernIr.dynamic.EndpointSnippetResponse> {
        return super.generate(request, options);
    }

    public generateSync(
        request: FernIr.dynamic.EndpointSnippetRequest,
        options: Options = {}
    ): FernIr.dynamic.EndpointSnippetResponse {
        return super.generateSync(request, options);
    }

    public async generateSnippetAst(
        request: FernIr.dynamic.EndpointSnippetRequest,
        options: Options = {}
    ): Promise<AbstractAstNode> {
        return super.generateSnippetAst(request, options);
    }

    /**
     * Generates just the method call AST without the client instantiation.
     * This is useful for wire tests where the client is created separately
     * with test-specific configuration.
     *
     * @param request - The snippet request
     * @param options - Optional options, including endpointId to resolve a specific endpoint
     *                  when multiple endpoints share the same HTTP method and path
     */
    public generateMethodCallSnippetAst({
        request,
        options = {}
    }: {
        request: FernIr.dynamic.EndpointSnippetRequest;
        options?: Options;
    }): python.AstNode {
        const endpoints = this.resolveEndpointsForMethodCall({ request, options });
        if (endpoints.length === 0) {
            throw new Error(`No endpoints found that match "${request.endpoint.method} ${request.endpoint.path}"`);
        }
        let lastError: Error | undefined = undefined;
        for (const endpoint of endpoints) {
            const context = this.context.clone() as DynamicSnippetsGeneratorContext;
            const snippetGenerator = this.createSnippetGenerator(context);
            try {
                return snippetGenerator.generateMethodCallSnippetAst({ endpoint, request });
            } catch (error) {
                lastError = error as Error;
            }
        }
        if (lastError != null) {
            throw lastError;
        }
        throw new Error(
            `Failed to generate method call snippet AST for endpoint: ${request.endpoint.method} ${request.endpoint.path}`
        );
    }

    private resolveEndpointsForMethodCall({
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

    protected createSnippetGenerator(context: DynamicSnippetsGeneratorContext): EndpointSnippetGenerator {
        return new EndpointSnippetGenerator({ context });
    }
}
