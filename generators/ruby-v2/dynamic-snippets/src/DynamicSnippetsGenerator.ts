import {
    AbstractAstNode,
    AbstractDynamicSnippetsGenerator,
    AbstractFormatter,
    FernGeneratorExec,
    Options
} from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext.js";
import { EndpointSnippetGenerator } from "./EndpointSnippetGenerator.js";

export class DynamicSnippetsGenerator extends AbstractDynamicSnippetsGenerator<
    DynamicSnippetsGeneratorContext,
    EndpointSnippetGenerator
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
        request: FernIr.dynamic.EndpointSnippetRequest,
        options: Options = {}
    ): Promise<FernIr.dynamic.EndpointSnippetResponse> {
        return super.generate(request, options);
    }

    public generateSync(request: FernIr.dynamic.EndpointSnippetRequest): FernIr.dynamic.EndpointSnippetResponse {
        return super.generateSync(request);
    }

    public async generateSnippetAst(
        request: FernIr.dynamic.EndpointSnippetRequest,
        options?: { skipClientInstantiation?: boolean }
    ): Promise<AbstractAstNode> {
        return super.generateSnippetAst(request, options);
    }

    protected createSnippetGenerator(context: DynamicSnippetsGeneratorContext): EndpointSnippetGenerator {
        return new EndpointSnippetGenerator({ context, formatter: this.formatter });
    }
}
