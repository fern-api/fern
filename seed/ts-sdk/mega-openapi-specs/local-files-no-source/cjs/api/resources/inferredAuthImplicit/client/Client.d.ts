import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { AuthClient } from "../resources/auth/client/Client.js";
import { NestedApiClient } from "../resources/nestedApi/client/Client.js";
import { NestedNoAuthApiClient } from "../resources/nestedNoAuthApi/client/Client.js";
import { SimpleClient } from "../resources/simple/client/Client.js";
export declare namespace InferredAuthImplicitClient {
    type Options = BaseClientOptions;
}
export declare class InferredAuthImplicitClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<InferredAuthImplicitClient.Options>;
    protected _auth: AuthClient | undefined;
    protected _nestedNoAuthApi: NestedNoAuthApiClient | undefined;
    protected _nestedApi: NestedApiClient | undefined;
    protected _simple: SimpleClient | undefined;
    constructor(options: InferredAuthImplicitClient.Options);
    get auth(): AuthClient;
    get nestedNoAuthApi(): NestedNoAuthApiClient;
    get nestedApi(): NestedApiClient;
    get simple(): SimpleClient;
}
