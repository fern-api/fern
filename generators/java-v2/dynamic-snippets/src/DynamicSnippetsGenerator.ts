import {
    AbstractAstNode,
    AbstractDynamicSnippetsGenerator,
    AbstractFormatter,
    FernGeneratorExec,
    Options
} from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";
import { EndpointSnippetGenerator } from "./EndpointSnippetGenerator";

export class DynamicSnippetsGenerator extends AbstractDynamicSnippetsGenerator<
    DynamicSnippetsGeneratorContext,
    EndpointSnippetGenerator
> {
    private formatter: AbstractFormatter | undefined;

    constructor({
        ir,
        config,
        options = {}
    }: {
        ir: FernIr.dynamic.DynamicIntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
        options?: Options;
    }) {
        super(new DynamicSnippetsGeneratorContext({ ir, config, options }));
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

    public async generateSnippetAst(request: FernIr.dynamic.EndpointSnippetRequest): Promise<AbstractAstNode> {
        return super.generateSnippetAst(request);
    }

    protected createSnippetGenerator(context: DynamicSnippetsGeneratorContext): EndpointSnippetGenerator {
        return new EndpointSnippetGenerator({ context });
    }
}
