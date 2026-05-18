import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
export declare namespace PlainTextClient {
    type Options = BaseClientOptions;
}
export declare class PlainTextClient {
    protected readonly _options: NormalizedClientOptions<PlainTextClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: PlainTextClient.Options);
    get service(): ServiceClient;
}
