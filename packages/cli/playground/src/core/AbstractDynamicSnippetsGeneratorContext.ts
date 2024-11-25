import { dynamic as DynamicSnippets, generatorExec as GeneratorExec } from "@fern-api/dynamic-ir-sdk/api";

export abstract class AbstractDynamicSnippetsGeneratorContext {
    public constructor(
        public readonly ir: DynamicSnippets.DynamicIntermediateRepresentation,
        public readonly config: GeneratorExec.GeneratorConfig
    ) {}
}
