import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace GoBytesRequestClient {
    type Options = BaseClientOptions;
}
export declare class GoBytesRequestClient {
    protected readonly _options: NormalizedClientOptions<GoBytesRequestClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: GoBytesRequestClient.Options);
    get service(): ServiceClient;
}
