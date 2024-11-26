import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

export abstract class AbstractDynamicSnippetsGeneratorContext<DynamicIntermediateRepresentation> {
    public constructor(
        public readonly ir: DynamicIntermediateRepresentation,
        public readonly config: FernGeneratorExec.GeneratorConfig
    ) {}
}
