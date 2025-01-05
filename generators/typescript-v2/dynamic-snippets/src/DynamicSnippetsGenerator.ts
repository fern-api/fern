import { AbstractDynamicSnippetsGenerator, FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";

import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";

export class DynamicSnippetsGenerator extends AbstractDynamicSnippetsGenerator<
    DynamicSnippetsGeneratorContext,
    FernIr.dynamic.EndpointSnippetRequest,
    FernIr.dynamic.EndpointSnippetResponse
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

    public async generate(
        request: FernIr.dynamic.EndpointSnippetRequest
    ): Promise<FernIr.dynamic.EndpointSnippetResponse> {
        return {
            snippet: "TODO: Implement me!",
            errors: undefined
        };
    }

    public generateSync(request: FernIr.dynamic.EndpointSnippetRequest): FernIr.dynamic.EndpointSnippetResponse {
        return {
            snippet: "TODO: Implement me!",
            errors: undefined
        };
    }
}
