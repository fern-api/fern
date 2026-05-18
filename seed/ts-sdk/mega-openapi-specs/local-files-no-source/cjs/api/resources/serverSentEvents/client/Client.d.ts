import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { CompletionsClient } from "../resources/completions/client/Client.js";
export declare namespace ServerSentEventsClient {
    type Options = BaseClientOptions;
}
export declare class ServerSentEventsClient {
    protected readonly _options: NormalizedClientOptions<ServerSentEventsClient.Options>;
    protected _completions: CompletionsClient | undefined;
    constructor(options: ServerSentEventsClient.Options);
    get completions(): CompletionsClient;
}
