import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
export declare namespace VariablesClient {
    type Options = BaseClientOptions;
}
export declare class VariablesClient {
    protected readonly _options: NormalizedClientOptions<VariablesClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: VariablesClient.Options);
    get service(): ServiceClient;
}
