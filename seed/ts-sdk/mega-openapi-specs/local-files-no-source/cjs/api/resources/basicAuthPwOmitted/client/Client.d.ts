import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { BasicAuthClient } from "../resources/basicAuth/client/Client.js";
export declare namespace BasicAuthPwOmittedClient {
    type Options = BaseClientOptions;
}
export declare class BasicAuthPwOmittedClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<BasicAuthPwOmittedClient.Options>;
    protected _basicAuth: BasicAuthClient | undefined;
    constructor(options: BasicAuthPwOmittedClient.Options);
    get basicAuth(): BasicAuthClient;
}
