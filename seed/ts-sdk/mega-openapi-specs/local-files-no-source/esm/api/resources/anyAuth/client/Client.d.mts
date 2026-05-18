import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import { AuthClient } from "../resources/auth/client/Client.mjs";
import { UserClient } from "../resources/user/client/Client.mjs";
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
