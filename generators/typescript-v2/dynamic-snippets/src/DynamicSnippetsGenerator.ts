import { AbstractDynamicSnippetsGenerator, FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";
import { dynamic } from "@fern-api/dynamic-ir-sdk/api";

export class DynamicSnippetsGenerator extends AbstractDynamicSnippetsGenerator<
    DynamicSnippetsGeneratorContext,
    dynamic.EndpointSnippetRequest,
    dynamic.EndpointSnippetResponse
> {
    constructor({
        ir,
        config
    }: {
        ir: dynamic.DynamicIntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
    }) {
        super(new DynamicSnippetsGeneratorContext({ ir, config }));
    }

    public async generate(request: dynamic.EndpointSnippetRequest): Promise<dynamic.EndpointSnippetResponse> {
        return {
            snippet: "TODO: Implement me!",
            errors: undefined
        };
    }

    public generateSync(request: dynamic.EndpointSnippetRequest): dynamic.EndpointSnippetResponse {
        return {
            snippet: "TODO: Implement me!",
            errors: undefined
        };
    }
}
