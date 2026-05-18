import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { UserClient } from "../resources/user/client/Client.mjs";
export declare namespace MultiLineDocsClient {
    type Options = BaseClientOptions;
}
export declare class MultiLineDocsClient {
    protected readonly _options: NormalizedClientOptions<MultiLineDocsClient.Options>;
    protected _user: UserClient | undefined;
    constructor(options: MultiLineDocsClient.Options);
    get user(): UserClient;
}
