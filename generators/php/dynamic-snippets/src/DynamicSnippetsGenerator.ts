import { AbstractDynamicSnippetsGenerator, FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";

import { EndpointSnippetGenerator } from "./EndpointSnippetGenerator";
import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";

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

    protected createSnippetGenerator(context: DynamicSnippetsGeneratorContext): EndpointSnippetGenerator {
        return new EndpointSnippetGenerator({ context });
    }
}
