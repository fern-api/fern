import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace PlainTextClient {
    type Options = BaseClientOptions;
}
export declare class PlainTextClient {
    protected readonly _options: NormalizedClientOptions<PlainTextClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: PlainTextClient.Options);
    get service(): ServiceClient;
}
