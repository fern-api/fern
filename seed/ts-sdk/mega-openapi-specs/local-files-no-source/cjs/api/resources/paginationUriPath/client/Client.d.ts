import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { UsersClient } from "../resources/users/client/Client.js";
export declare namespace PaginationUriPathClient {
    type Options = BaseClientOptions;
}
export declare class PaginationUriPathClient {
    protected readonly _options: NormalizedClientOptions<PaginationUriPathClient.Options>;
    protected _users: UsersClient | undefined;
    constructor(options: PaginationUriPathClient.Options);
    get users(): UsersClient;
}
