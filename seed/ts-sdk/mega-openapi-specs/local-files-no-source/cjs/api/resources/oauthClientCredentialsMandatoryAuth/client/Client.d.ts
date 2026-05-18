import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { AuthClient } from "../resources/auth/client/Client.js";
import { NestedApiClient } from "../resources/nestedApi/client/Client.js";
import { SimpleClient } from "../resources/simple/client/Client.js";
export declare namespace OauthClientCredentialsMandatoryAuthClient {
    type Options = BaseClientOptions;
}
export declare class OauthClientCredentialsMandatoryAuthClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<OauthClientCredentialsMandatoryAuthClient.Options>;
    protected _auth: AuthClient | undefined;
    protected _nestedApi: NestedApiClient | undefined;
    protected _simple: SimpleClient | undefined;
    constructor(options: OauthClientCredentialsMandatoryAuthClient.Options);
    get auth(): AuthClient;
    get nestedApi(): NestedApiClient;
    get simple(): SimpleClient;
}
