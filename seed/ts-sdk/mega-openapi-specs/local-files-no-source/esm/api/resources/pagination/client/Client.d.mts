import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import { ComplexClient } from "../resources/complex/client/Client.mjs";
import { InlineUsersClient } from "../resources/inlineUsers/client/Client.mjs";
import { UsersClient } from "../resources/users/client/Client.mjs";
export declare namespace PaginationClient {
    type Options = BaseClientOptions;
}
export declare class PaginationClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<PaginationClient.Options>;
    protected _complex: ComplexClient | undefined;
    protected _users: UsersClient | undefined;
    protected _inlineUsers: InlineUsersClient | undefined;
    constructor(options: PaginationClient.Options);
    get complex(): ComplexClient;
    get users(): UsersClient;
    get inlineUsers(): InlineUsersClient;
}
