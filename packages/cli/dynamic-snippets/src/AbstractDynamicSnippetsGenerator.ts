import { dynamic as DynamicSnippets } from "@fern-api/ir-sdk";
import { AbstractDynamicSnippetsGeneratorContext } from "./AbstractDynamicSnippetsGeneratorContext";

export abstract class AbstractDynamicSnippetsGenerator<Context extends AbstractDynamicSnippetsGeneratorContext> {
    public constructor(public readonly context: Context) {}

    /**
     * Generates code for the specified request.
     * @param request
     */
    public abstract generate(
        request: DynamicSnippets.EndpointSnippetRequest
    ): Promise<DynamicSnippets.EndpointSnippetResponse>;
}
