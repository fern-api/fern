import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace ApiWideBasePathClient {
    type Options = BaseClientOptions;
}
export declare class ApiWideBasePathClient {
    protected readonly _options: NormalizedClientOptions<ApiWideBasePathClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: ApiWideBasePathClient.Options);
    get service(): ServiceClient;
}
