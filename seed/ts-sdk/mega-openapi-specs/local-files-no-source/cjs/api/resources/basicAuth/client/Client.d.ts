import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { BasicAuthClient as BasicAuthClient_ } from "../resources/basicAuth/client/Client.js";
export declare namespace BasicAuthClient {
    type Options = BaseClientOptions;
}
export declare class BasicAuthClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<BasicAuthClient.Options>;
    protected _basicAuth: BasicAuthClient_ | undefined;
    constructor(options: BasicAuthClient.Options);
    get basicAuth(): BasicAuthClient_;
}
