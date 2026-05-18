import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import { UserClient } from "../resources/user/client/Client.mjs";
export declare namespace SimpleApiClient {
    type Options = BaseClientOptions;
}
export declare class SimpleApiClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<SimpleApiClient.Options>;
    protected _user: UserClient | undefined;
    constructor(options: SimpleApiClient.Options);
    get user(): UserClient;
}
