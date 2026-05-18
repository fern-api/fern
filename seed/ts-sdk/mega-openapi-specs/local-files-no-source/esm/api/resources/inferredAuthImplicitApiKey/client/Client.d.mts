import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import { AuthClient } from "../resources/auth/client/Client.mjs";
import { NestedApiClient } from "../resources/nestedApi/client/Client.mjs";
import { NestedNoAuthApiClient } from "../resources/nestedNoAuthApi/client/Client.mjs";
import { SimpleClient } from "../resources/simple/client/Client.mjs";
export declare namespace InferredAuthImplicitApiKeyClient {
    type Options = BaseClientOptions;
}
export declare class InferredAuthImplicitApiKeyClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<InferredAuthImplicitApiKeyClient.Options>;
    protected _auth: AuthClient | undefined;
    protected _nestedNoAuthApi: NestedNoAuthApiClient | undefined;
    protected _nestedApi: NestedApiClient | undefined;
    protected _simple: SimpleClient | undefined;
    constructor(options: InferredAuthImplicitApiKeyClient.Options);
    get auth(): AuthClient;
    get nestedNoAuthApi(): NestedNoAuthApiClient;
    get nestedApi(): NestedApiClient;
    get simple(): SimpleClient;
}
