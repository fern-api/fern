import {
    AbstractDynamicSnippetsGenerator,
    AbstractDynamicSnippetsGeneratorContext,
    Result
} from "@fern-api/browser-compatible-base-generator";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";
import { EndpointSnippetGenerator } from "./EndpointSnippetGenerator";

export class DynamicSnippetsGenerator extends AbstractDynamicSnippetsGenerator<DynamicSnippetsGeneratorContext> {
    protected initializeContext({
        ir,
        config
    }: {
        ir: FernGeneratorExec.dynamic.IntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
    }): AbstractDynamicSnippetsGeneratorContext<DynamicSnippetsGeneratorContext> {
        return new DynamicSnippetsGeneratorContext({ ir, config });
    }

    public generate(
        request: FernGeneratorExec.dynamic.EndpointSnippetRequest
    ): Result<FernGeneratorExec.Snippet, FernGeneratorExec.SnippetGenerationFailure> {
        const generator = new EndpointSnippetGenerator({ context: this.context });
        return generator.generate(request);
    }
}
