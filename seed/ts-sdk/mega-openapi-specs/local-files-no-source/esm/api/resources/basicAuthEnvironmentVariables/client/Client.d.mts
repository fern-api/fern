import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import { BasicAuthClient } from "../resources/basicAuth/client/Client.mjs";
export declare namespace BasicAuthEnvironmentVariablesClient {
    type Options = BaseClientOptions;
}
export declare class BasicAuthEnvironmentVariablesClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<BasicAuthEnvironmentVariablesClient.Options>;
    protected _basicAuth: BasicAuthClient | undefined;
    constructor(options: BasicAuthEnvironmentVariablesClient.Options);
    get basicAuth(): BasicAuthClient;
}
