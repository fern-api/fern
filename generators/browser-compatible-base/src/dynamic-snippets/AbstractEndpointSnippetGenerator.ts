import { FernIr } from "@fern-api/dynamic-ir-sdk";

import { AbstractDynamicSnippetsGeneratorContext } from "./AbstractDynamicSnippetsGeneratorContext";

export abstract class AbstractEndpointSnippetGenerator<Context extends AbstractDynamicSnippetsGeneratorContext> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public constructor({ context }: { context: Context }) {
        // eslint-disable-line @typescript-eslint/no-useless-constructor
    }

    public abstract generateSnippet({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): Promise<string>;

    public abstract generateSnippetSync({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): string;
}
