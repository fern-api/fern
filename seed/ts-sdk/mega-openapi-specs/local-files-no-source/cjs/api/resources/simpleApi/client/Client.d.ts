import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { UserClient } from "../resources/user/client/Client.js";
export declare namespace SimpleApiClient {
    type Options = BaseClientOptions;
}
export declare class SimpleApiClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<SimpleApiClient.Options>;
    protected _user: UserClient | undefined;
    constructor(options: SimpleApiClient.Options);
    get user(): UserClient;
}
