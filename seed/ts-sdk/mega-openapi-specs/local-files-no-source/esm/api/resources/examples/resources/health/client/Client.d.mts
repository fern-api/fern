import type { BaseClientOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
export declare namespace HealthClient {
    type Options = BaseClientOptions;
}
export declare class HealthClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<HealthClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: HealthClient.Options);
    get service(): ServiceClient;
}
