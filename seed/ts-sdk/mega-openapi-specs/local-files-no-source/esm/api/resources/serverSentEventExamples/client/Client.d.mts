import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { CompletionsClient } from "../resources/completions/client/Client.mjs";
export declare namespace ServerSentEventExamplesClient {
    type Options = BaseClientOptions;
}
export declare class ServerSentEventExamplesClient {
    protected readonly _options: NormalizedClientOptions<ServerSentEventExamplesClient.Options>;
    protected _completions: CompletionsClient | undefined;
    constructor(options: ServerSentEventExamplesClient.Options);
    get completions(): CompletionsClient;
}
