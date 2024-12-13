import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec
} from "@fern-api/browser-compatible-base-generator";
import { dynamic } from "@fern-fern/ir-sdk/api";

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext<dynamic.DynamicIntermediateRepresentation> {
    constructor({
        ir,
        config
    }: {
        ir: dynamic.DynamicIntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
    }) {
        super(ir, config);
    }
}
