import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace VariablesClient {
    type Options = BaseClientOptions;
}
export declare class VariablesClient {
    protected readonly _options: NormalizedClientOptions<VariablesClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: VariablesClient.Options);
    get service(): ServiceClient;
}
