import { AbstractDynamicSnippetsGenerator, FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
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

    protected createSnippetGenerator(context: DynamicSnippetsGeneratorContext): EndpointSnippetGenerator {
        return new EndpointSnippetGenerator({ context });
    }
}
