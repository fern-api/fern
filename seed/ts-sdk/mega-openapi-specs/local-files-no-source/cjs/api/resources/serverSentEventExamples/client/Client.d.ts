import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { CompletionsClient } from "../resources/completions/client/Client.js";
export declare namespace ServerSentEventExamplesClient {
    type Options = BaseClientOptions;
}
export declare class ServerSentEventExamplesClient {
    protected readonly _options: NormalizedClientOptions<ServerSentEventExamplesClient.Options>;
    protected _completions: CompletionsClient | undefined;
    constructor(options: ServerSentEventExamplesClient.Options);
    get completions(): CompletionsClient;
}
