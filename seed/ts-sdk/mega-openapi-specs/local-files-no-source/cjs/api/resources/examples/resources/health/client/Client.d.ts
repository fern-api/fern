import type { BaseClientOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace HealthClient {
    type Options = BaseClientOptions;
}
export declare class HealthClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<HealthClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: HealthClient.Options);
    get service(): ServiceClient;
}
