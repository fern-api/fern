import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { ts } from "@fern-api/typescript-ast";

export class EndpointSnippetGenerator {
    public async generateSnippet({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): Promise<string> {
        return ts.TypeLiteral.string("TODO: Implement me!").toString();
    }

    public generateSnippetSync({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): string {
        return ts.TypeLiteral.string("TODO: Implement me!").toString();
    }
}
