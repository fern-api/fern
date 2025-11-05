import { Options } from "./Options";
import { DynamicSnippetsGeneratorContextLike, EndpointLike, EndpointSnippetRequestLike } from "./types";

export abstract class AbstractEndpointSnippetGenerator<
    Context extends DynamicSnippetsGeneratorContextLike<EndpointT>,
    EndpointT extends EndpointLike = EndpointLike,
    RequestT extends EndpointSnippetRequestLike = EndpointSnippetRequestLike
> {
    public abstract generateSnippet({
        endpoint,
        request,
        options
    }: {
        endpoint: EndpointT;
        request: RequestT;
        options?: Options;
    }): Promise<string>;

    public abstract generateSnippetSync({
        endpoint,
        request,
        options
    }: {
        endpoint: EndpointT;
        request: RequestT;
        options?: Options;
    }): string;
}
