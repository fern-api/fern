import {
    AbstractDynamicSnippetsGenerator,
    FernGeneratorExec,
    Options
} from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { DynamicSnippetsGeneratorContext } from "./context";
import { EndpointSnippetGenerator } from "./EndpointSnippetGenerator";

export class DynamicSnippetsGenerator extends AbstractDynamicSnippetsGenerator<
    DynamicSnippetsGeneratorContext,
    EndpointSnippetGenerator
> {
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

    protected createSnippetGenerator(context: DynamicSnippetsGeneratorContext): EndpointSnippetGenerator {
        return new EndpointSnippetGenerator({ context });
    }
}
