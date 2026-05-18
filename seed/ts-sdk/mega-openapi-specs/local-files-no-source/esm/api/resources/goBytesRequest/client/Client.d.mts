import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
export declare namespace GoBytesRequestClient {
    type Options = BaseClientOptions;
}
export declare class GoBytesRequestClient {
    protected readonly _options: NormalizedClientOptions<GoBytesRequestClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: GoBytesRequestClient.Options);
    get service(): ServiceClient;
}
