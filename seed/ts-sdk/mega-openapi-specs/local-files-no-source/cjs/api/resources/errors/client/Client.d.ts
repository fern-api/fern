import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { SimpleClient } from "../resources/simple/client/Client.js";
export declare namespace ErrorsClient {
    type Options = BaseClientOptions;
}
export declare class ErrorsClient {
    protected readonly _options: NormalizedClientOptions<ErrorsClient.Options>;
    protected _simple: SimpleClient | undefined;
    constructor(options: ErrorsClient.Options);
    get simple(): SimpleClient;
}
