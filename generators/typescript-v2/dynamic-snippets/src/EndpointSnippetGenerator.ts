import { dynamic } from "@fern-fern/ir-sdk/api";
import { ts } from "@fern-api/typescript-ast";

export class EndpointSnippetGenerator {
    public async generateSnippet({
        endpoint,
        request
    }: {
        endpoint: dynamic.Endpoint;
        request: dynamic.EndpointSnippetRequest;
    }): Promise<string> {
        return ts.TypeLiteral.string("TODO: Implement me!").toString();
    }

    public generateSnippetSync({
        endpoint,
        request
    }: {
        endpoint: dynamic.Endpoint;
        request: dynamic.EndpointSnippetRequest;
    }): string {
        return ts.TypeLiteral.string("TODO: Implement me!").toString();
    }
}
