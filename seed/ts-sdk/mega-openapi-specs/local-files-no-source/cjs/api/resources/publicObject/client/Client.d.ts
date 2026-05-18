import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace PublicObjectClient {
    type Options = BaseClientOptions;
}
export declare class PublicObjectClient {
    protected readonly _options: NormalizedClientOptions<PublicObjectClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: PublicObjectClient.Options);
    get service(): ServiceClient;
}
