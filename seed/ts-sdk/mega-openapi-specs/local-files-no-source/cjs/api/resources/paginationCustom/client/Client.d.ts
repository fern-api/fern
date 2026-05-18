import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { UsersClient } from "../resources/users/client/Client.js";
export declare namespace PaginationCustomClient {
    type Options = BaseClientOptions;
}
export declare class PaginationCustomClient {
    protected readonly _options: NormalizedClientOptions<PaginationCustomClient.Options>;
    protected _users: UsersClient | undefined;
    constructor(options: PaginationCustomClient.Options);
    get users(): UsersClient;
}
