import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace ResponsePropertyClient {
    type Options = BaseClientOptions;
}
export declare class ResponsePropertyClient {
    protected readonly _options: NormalizedClientOptions<ResponsePropertyClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: ResponsePropertyClient.Options);
    get service(): ServiceClient;
}
