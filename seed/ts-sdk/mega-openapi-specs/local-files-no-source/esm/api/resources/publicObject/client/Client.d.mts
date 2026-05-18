import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
export declare namespace PublicObjectClient {
    type Options = BaseClientOptions;
}
export declare class PublicObjectClient {
    protected readonly _options: NormalizedClientOptions<PublicObjectClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: PublicObjectClient.Options);
    get service(): ServiceClient;
}
