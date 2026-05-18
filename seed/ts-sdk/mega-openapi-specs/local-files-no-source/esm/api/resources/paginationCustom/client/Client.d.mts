import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { UsersClient } from "../resources/users/client/Client.mjs";
export declare namespace PaginationCustomClient {
    type Options = BaseClientOptions;
}
export declare class PaginationCustomClient {
    protected readonly _options: NormalizedClientOptions<PaginationCustomClient.Options>;
    protected _users: UsersClient | undefined;
    constructor(options: PaginationCustomClient.Options);
    get users(): UsersClient;
}
