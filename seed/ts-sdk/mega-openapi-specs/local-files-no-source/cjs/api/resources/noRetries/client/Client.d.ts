import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { RetriesClient } from "../resources/retries/client/Client.js";
export declare namespace NoRetriesClient {
    type Options = BaseClientOptions;
}
export declare class NoRetriesClient {
    protected readonly _options: NormalizedClientOptions<NoRetriesClient.Options>;
    protected _retries: RetriesClient | undefined;
    constructor(options: NoRetriesClient.Options);
    get retries(): RetriesClient;
}
