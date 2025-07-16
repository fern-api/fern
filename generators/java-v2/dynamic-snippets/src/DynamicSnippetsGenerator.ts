import {
    AbstractDynamicSnippetsGenerator,
    AbstractFormatter,
    FernGeneratorExec,
    Options
} from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";

import { EndpointSnippetGenerator } from "./EndpointSnippetGenerator";
import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";

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

    protected createSnippetGenerator(context: DynamicSnippetsGeneratorContext): EndpointSnippetGenerator {
        return new EndpointSnippetGenerator({ context });
    }
}
