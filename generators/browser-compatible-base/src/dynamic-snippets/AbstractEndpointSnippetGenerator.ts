import { FernIr } from "@fern-api/dynamic-ir-sdk";

import { AbstractDynamicSnippetsGeneratorContext } from "./AbstractDynamicSnippetsGeneratorContext";

export abstract class AbstractEndpointSnippetGenerator<Context extends AbstractDynamicSnippetsGeneratorContext> {
    protected readonly context: Context;

    public constructor({ context }: { context: Context }) {
        this.context = context;
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
