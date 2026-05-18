import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import { AuthClient } from "../resources/auth/client/Client.mjs";
import { NestedApiClient } from "../resources/nestedApi/client/Client.mjs";
import { SimpleClient } from "../resources/simple/client/Client.mjs";
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
