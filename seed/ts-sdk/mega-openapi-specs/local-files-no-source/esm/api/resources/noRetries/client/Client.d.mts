import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { RetriesClient } from "../resources/retries/client/Client.mjs";
export declare namespace NoRetriesClient {
    type Options = BaseClientOptions;
}
export declare class NoRetriesClient {
    protected readonly _options: NormalizedClientOptions<NoRetriesClient.Options>;
    protected _retries: RetriesClient | undefined;
    constructor(options: NoRetriesClient.Options);
    get retries(): RetriesClient;
}
