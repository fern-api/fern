import { ErrorReporter } from "./ErrorReporter";
import { DynamicSnippetsGeneratorContextLike, EndpointLocationLike, EndpointSnippetResponseLike } from "./types";

export class Result {
    public reporter: ErrorReporter | undefined;
    public snippet: string | undefined;
    public err: Error | undefined;

    constructor() {
        this.snippet = undefined;
        this.reporter = undefined;
        this.err = undefined;
    }

    public update({ context, snippet }: { context: DynamicSnippetsGeneratorContextLike; snippet: string }): void {
        if (this.shouldUpdate({ snippet, reporter: context.errors })) {
            if ("clone" in context.errors && typeof context.errors.clone === "function") {
                this.reporter = context.errors.clone() as ErrorReporter;
            }
            this.snippet = snippet;
        }
    }

    public getResponseOrThrow({ endpoint }: { endpoint: EndpointLocationLike }): EndpointSnippetResponseLike {
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
