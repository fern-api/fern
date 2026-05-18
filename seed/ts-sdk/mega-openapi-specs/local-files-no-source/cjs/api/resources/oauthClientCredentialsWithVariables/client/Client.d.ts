import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { AuthClient } from "../resources/auth/client/Client.js";
import { NestedApiClient } from "../resources/nestedApi/client/Client.js";
import { NestedNoAuthApiClient } from "../resources/nestedNoAuthApi/client/Client.js";
import { ServiceClient } from "../resources/service/client/Client.js";
import { SimpleClient } from "../resources/simple/client/Client.js";
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
