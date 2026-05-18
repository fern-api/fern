import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
export declare namespace BearerTokenEnvironmentVariableClient {
    type Options = BaseClientOptions;
}
export declare class BearerTokenEnvironmentVariableClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<BearerTokenEnvironmentVariableClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: BearerTokenEnvironmentVariableClient.Options);
    get service(): ServiceClient;
}
