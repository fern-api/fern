import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import { BasicAuthClient } from "../resources/basicAuth/client/Client.mjs";
export declare namespace BasicAuthPwOmittedClient {
    type Options = BaseClientOptions;
}
export declare class BasicAuthPwOmittedClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<BasicAuthPwOmittedClient.Options>;
    protected _basicAuth: BasicAuthClient | undefined;
    constructor(options: BasicAuthPwOmittedClient.Options);
    get basicAuth(): BasicAuthClient;
}
