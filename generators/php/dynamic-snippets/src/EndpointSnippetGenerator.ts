import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { php } from "@fern-api/php-codegen";

import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";

const SNIPPET_NAMESPACE = "Example";

export class EndpointSnippetGenerator {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public async generateSnippet({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): Promise<string> {
        const code = this.buildCodeBlock({ endpoint, snippet: request });
        return await code.toStringAsync({
            namespace: SNIPPET_NAMESPACE,
            rootNamespace: SNIPPET_NAMESPACE,
            customConfig: this.context.customConfig ?? {}
        });
    }

    public generateSnippetSync({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): string {
        const code = this.buildCodeBlock({ endpoint, snippet: request });
        return code.toString({
            namespace: SNIPPET_NAMESPACE,
            rootNamespace: SNIPPET_NAMESPACE,
            customConfig: this.context.customConfig ?? {}
        });
    }

    private buildCodeBlock({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): php.AstNode {
        return php.TypeLiteral.nop();
    }
}
