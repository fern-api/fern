import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import { AuthClient } from "../resources/auth/client/Client.mjs";
import { NestedApiClient } from "../resources/nestedApi/client/Client.mjs";
import { NestedNoAuthApiClient } from "../resources/nestedNoAuthApi/client/Client.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
import { SimpleClient } from "../resources/simple/client/Client.mjs";
export declare namespace OauthClientCredentialsWithVariablesClient {
    type Options = BaseClientOptions;
}
export declare class OauthClientCredentialsWithVariablesClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<OauthClientCredentialsWithVariablesClient.Options>;
    protected _auth: AuthClient | undefined;
    protected _nestedNoAuthApi: NestedNoAuthApiClient | undefined;
    protected _nestedApi: NestedApiClient | undefined;
    protected _service: ServiceClient | undefined;
    protected _simple: SimpleClient | undefined;
    constructor(options: OauthClientCredentialsWithVariablesClient.Options);
    get auth(): AuthClient;
    get nestedNoAuthApi(): NestedNoAuthApiClient;
    get nestedApi(): NestedApiClient;
    get service(): ServiceClient;
    get simple(): SimpleClient;
}
