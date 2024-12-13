import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec
} from "@fern-api/browser-compatible-base-generator";
import { dynamic } from "@fern-api/dynamic-ir-sdk/api";

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext {
    constructor({
        ir,
        config
    }: {
        ir: dynamic.DynamicIntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
    }) {
        super({ ir, config });
    }
}
