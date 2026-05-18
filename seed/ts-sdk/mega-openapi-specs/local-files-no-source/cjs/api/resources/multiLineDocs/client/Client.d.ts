import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { UserClient } from "../resources/user/client/Client.js";
export declare namespace MultiLineDocsClient {
    type Options = BaseClientOptions;
}
export declare class MultiLineDocsClient {
    protected readonly _options: NormalizedClientOptions<MultiLineDocsClient.Options>;
    protected _user: UserClient | undefined;
    constructor(options: MultiLineDocsClient.Options);
    get user(): UserClient;
}
