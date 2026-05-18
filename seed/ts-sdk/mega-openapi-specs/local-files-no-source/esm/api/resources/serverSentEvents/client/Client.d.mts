import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { CompletionsClient } from "../resources/completions/client/Client.mjs";
export declare namespace ServerSentEventsClient {
    type Options = BaseClientOptions;
}
export declare class ServerSentEventsClient {
    protected readonly _options: NormalizedClientOptions<ServerSentEventsClient.Options>;
    protected _completions: CompletionsClient | undefined;
    constructor(options: ServerSentEventsClient.Options);
    get completions(): CompletionsClient;
}
