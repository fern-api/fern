import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { AuthClient } from "../resources/auth/client/Client.js";
import { UserClient } from "../resources/user/client/Client.js";
export declare namespace EndpointSecurityAuthClient {
    type Options = BaseClientOptions;
}
export declare class EndpointSecurityAuthClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<EndpointSecurityAuthClient.Options>;
    protected _auth: AuthClient | undefined;
    protected _user: UserClient | undefined;
    constructor(options: EndpointSecurityAuthClient.Options);
    get auth(): AuthClient;
    get user(): UserClient;
}
