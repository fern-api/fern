import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { BasicAuthClient } from "../resources/basicAuth/client/Client.js";
export declare namespace BasicAuthEnvironmentVariablesClient {
    type Options = BaseClientOptions;
}
export declare class BasicAuthEnvironmentVariablesClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<BasicAuthEnvironmentVariablesClient.Options>;
    protected _basicAuth: BasicAuthClient | undefined;
    constructor(options: BasicAuthEnvironmentVariablesClient.Options);
    get basicAuth(): BasicAuthClient;
}
