import { Options } from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";

import { Config } from "./Config";
import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";

export class EndpointSnippetGenerator {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public async generateSnippet({
        endpoint,
        request,
        options
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
        options: Options;
    }): Promise<string> {
        const _config = this.getConfig(options);
        // TODO(kafkas): Implement this
        return 'print("Hello, world!")';
    }

    public generateSnippetSync({
        endpoint,
        request,
        options
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
        options: Options;
    }): string {
        const _config = this.getConfig(options);
        // TODO(kafkas): Implement this
        return 'print("Hello, world!")';
    }

    private getConfig(options: Options): Config {
        return options.config ?? this.context.options.config ?? {};
    }
}
