import { AbstractDynamicSnippetsGeneratorContext } from "./AbstractDynamicSnippetsGeneratorContext";

export abstract class AbstractDynamicSnippetsGenerator<
    DynamicIntermediateRepresentation,
    Context extends AbstractDynamicSnippetsGeneratorContext<DynamicIntermediateRepresentation>,
    EndpointSnippetRequest,
    EndpointSnippetResponse
> {
    public constructor(public readonly context: Context) {}

    /**
     * Generates code for the specified request.
     * @param request
     */
    public abstract generate(request: EndpointSnippetRequest): Promise<EndpointSnippetResponse>;
}
