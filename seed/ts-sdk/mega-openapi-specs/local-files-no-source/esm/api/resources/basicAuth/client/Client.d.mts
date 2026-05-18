import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import { BasicAuthClient as BasicAuthClient_ } from "../resources/basicAuth/client/Client.mjs";
export declare namespace BasicAuthClient {
    type Options = BaseClientOptions;
}
export declare class BasicAuthClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<BasicAuthClient.Options>;
    protected _basicAuth: BasicAuthClient_ | undefined;
    constructor(options: BasicAuthClient.Options);
    get basicAuth(): BasicAuthClient_;
}
