import { FernIr } from "@fern-api/dynamic-ir-sdk";

import { AbstractDynamicSnippetsGeneratorContext } from "./AbstractDynamicSnippetsGeneratorContext";
import { ErrorReporter } from "./ErrorReporter";

export class Result {
    public reporter: ErrorReporter | undefined;
    public snippet: string | undefined;
    public err: Error | undefined;

    constructor() {
        this.snippet = undefined;
        this.reporter = undefined;
        this.err = undefined;
    }

    public update({ context, snippet }: { context: AbstractDynamicSnippetsGeneratorContext; snippet: string }): void {
        if (this.shouldUpdate({ snippet, reporter: context.errors })) {
            this.reporter = context.errors.clone();
            this.snippet = snippet;
        }
    }

    public getResponseOrThrow({
        endpoint
    }: {
        endpoint: FernIr.dynamic.EndpointLocation;
    }): FernIr.dynamic.EndpointSnippetResponse {
        if (this.snippet != null && this.reporter != null) {
            return {
                snippet: this.snippet,
                errors: this.reporter.toDynamicSnippetErrors()
            };
        }
        throw this.err ?? new Error(`Failed to generate snippet for endpoint "${endpoint.method} ${endpoint.path}"`);
    }

    private shouldUpdate({ snippet, reporter }: { snippet: string; reporter: ErrorReporter }): boolean {
        if (this.reporter == null || (this.reporter.size() > 0 && reporter.size() === 0)) {
            return true;
        }
        return snippet.length > (this.snippet?.length ?? 0);
    }
}
