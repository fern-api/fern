import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { AuthClient } from "../resources/auth/client/Client.js";
import { SimpleClient } from "../resources/simple/client/Client.js";
export declare namespace OauthClientCredentialsReferenceClient {
    type Options = BaseClientOptions;
}
export declare class OauthClientCredentialsReferenceClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<OauthClientCredentialsReferenceClient.Options>;
    protected _auth: AuthClient | undefined;
    protected _simple: SimpleClient | undefined;
    constructor(options: OauthClientCredentialsReferenceClient.Options);
    get auth(): AuthClient;
    get simple(): SimpleClient;
}
