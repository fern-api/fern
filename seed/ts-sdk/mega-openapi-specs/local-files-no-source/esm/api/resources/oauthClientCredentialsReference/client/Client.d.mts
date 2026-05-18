import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import { AuthClient } from "../resources/auth/client/Client.mjs";
import { SimpleClient } from "../resources/simple/client/Client.mjs";
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
