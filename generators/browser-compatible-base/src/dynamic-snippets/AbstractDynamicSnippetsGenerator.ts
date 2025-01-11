import { AbstractDynamicSnippetsGeneratorContext } from "./AbstractDynamicSnippetsGeneratorContext";

export abstract class AbstractDynamicSnippetsGenerator<
    Context extends AbstractDynamicSnippetsGeneratorContext,
    EndpointSnippetRequest,
    EndpointSnippetResponse
> {
    public constructor(public readonly context: Context) {}

    /**
     * Generates code for the specified request.
     * @param request
     */
    public abstract generate(request: EndpointSnippetRequest): Promise<EndpointSnippetResponse>;

    /**
     * Generates code for the specified request.
     * @param request
     */
    public abstract generateSync(request: EndpointSnippetRequest): EndpointSnippetResponse;
}
