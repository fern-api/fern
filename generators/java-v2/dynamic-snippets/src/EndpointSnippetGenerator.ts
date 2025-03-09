import { AbstractFormatter } from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";

import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";

export class EndpointSnippetGenerator {
    private context: DynamicSnippetsGeneratorContext;
    private formatter: AbstractFormatter | undefined;

    constructor({ context, formatter }: { context: DynamicSnippetsGeneratorContext; formatter?: AbstractFormatter }) {
        this.context = context;
        this.formatter = formatter;
    }

    public async generateSnippet({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): Promise<string> {
        return "TODO: Implement me!";
    }

    public generateSnippetSync({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): string {
        return "TODO: Implement me!";
    }
}
