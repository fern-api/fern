import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace AcceptHeaderClient {
    type Options = BaseClientOptions;
}
export declare class AcceptHeaderClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<AcceptHeaderClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: AcceptHeaderClient.Options);
    get service(): ServiceClient;
}
