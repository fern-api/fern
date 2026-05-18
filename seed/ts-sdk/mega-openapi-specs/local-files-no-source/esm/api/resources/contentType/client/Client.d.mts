import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
export declare namespace ContentTypeClient {
    type Options = BaseClientOptions;
}
export declare class ContentTypeClient {
    protected readonly _options: NormalizedClientOptions<ContentTypeClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: ContentTypeClient.Options);
    get service(): ServiceClient;
}
