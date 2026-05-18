import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
export declare namespace ApiWideBasePathClient {
    type Options = BaseClientOptions;
}
export declare class ApiWideBasePathClient {
    protected readonly _options: NormalizedClientOptions<ApiWideBasePathClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: ApiWideBasePathClient.Options);
    get service(): ServiceClient;
}
