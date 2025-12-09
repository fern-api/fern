import {
    AbstractAstNode,
    AbstractDynamicSnippetsGenerator,
    FernGeneratorExec
} from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { python } from "@fern-api/python-ast";
import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";
import { EndpointSnippetGenerator } from "./EndpointSnippetGenerator";

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
        request: FernIr.dynamic.EndpointSnippetRequest
    ): Promise<FernIr.dynamic.EndpointSnippetResponse> {
        return super.generate(request);
    }

    public generateSync(request: FernIr.dynamic.EndpointSnippetRequest): FernIr.dynamic.EndpointSnippetResponse {
        return super.generateSync(request);
    }

    public async generateSnippetAst(request: FernIr.dynamic.EndpointSnippetRequest): Promise<AbstractAstNode> {
        return super.generateSnippetAst(request);
    }

    /**
     * Generates just the method call AST without the client instantiation.
     * This is useful for wire tests where the client is created separately
     * with test-specific configuration.
     */
    public generateMethodCallSnippetAst(request: FernIr.dynamic.EndpointSnippetRequest): python.AstNode {
        const endpoints = this.context.resolveEndpointLocationOrThrow(request.endpoint);
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

    protected createSnippetGenerator(context: DynamicSnippetsGeneratorContext): EndpointSnippetGenerator {
        return new EndpointSnippetGenerator({ context });
    }
}
