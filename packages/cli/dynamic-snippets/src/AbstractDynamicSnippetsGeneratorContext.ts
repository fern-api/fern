import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { dynamic as DynamicSnippets } from "@fern-api/ir-sdk";

export abstract class AbstractDynamicSnippetsGeneratorContext {
    public constructor(
        public readonly ir: DynamicSnippets.DynamicIntermediateRepresentation,
        public readonly config: FernGeneratorExec.GeneratorConfig
    ) {}
}
