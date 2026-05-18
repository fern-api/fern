import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace ContentTypeClient {
    type Options = BaseClientOptions;
}
export declare class ContentTypeClient {
    protected readonly _options: NormalizedClientOptions<ContentTypeClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: ContentTypeClient.Options);
    get service(): ServiceClient;
}
