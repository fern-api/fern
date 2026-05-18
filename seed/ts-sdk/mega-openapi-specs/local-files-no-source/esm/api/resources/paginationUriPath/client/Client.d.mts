import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { UsersClient } from "../resources/users/client/Client.mjs";
export declare namespace PaginationUriPathClient {
    type Options = BaseClientOptions;
}
export declare class PaginationUriPathClient {
    protected readonly _options: NormalizedClientOptions<PaginationUriPathClient.Options>;
    protected _users: UsersClient | undefined;
    constructor(options: PaginationUriPathClient.Options);
    get users(): UsersClient;
}
