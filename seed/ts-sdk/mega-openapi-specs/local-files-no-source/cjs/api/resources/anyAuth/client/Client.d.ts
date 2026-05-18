import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { AuthClient } from "../resources/auth/client/Client.js";
import { UserClient } from "../resources/user/client/Client.js";
export declare namespace AnyAuthClient {
    type Options = BaseClientOptions;
}
export declare class AnyAuthClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<AnyAuthClient.Options>;
    protected _auth: AuthClient | undefined;
    protected _user: UserClient | undefined;
    constructor(options: AnyAuthClient.Options);
    get auth(): AuthClient;
    get user(): UserClient;
}
