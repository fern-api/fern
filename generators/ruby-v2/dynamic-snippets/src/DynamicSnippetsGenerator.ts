import {
    AbstractAstNode,
    AbstractDynamicSnippetsGenerator,
    AbstractFormatter,
    FernGeneratorExec
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
        return super.generate(request);
    }

    public generateSync(request: FernIr.dynamic.EndpointSnippetRequest): FernIr.dynamic.EndpointSnippetResponse {
        return super.generateSync(request);
    }

    public async generateSnippetAst(request: FernIr.dynamic.EndpointSnippetRequest): Promise<AbstractAstNode> {
        return super.generateSnippetAst(request);
    }

    protected createSnippetGenerator(context: DynamicSnippetsGeneratorContext): EndpointSnippetGenerator {
        return new EndpointSnippetGenerator({ context, formatter: this.formatter });
    }
}
