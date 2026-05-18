import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ConversationsClient } from "../resources/conversations/client/Client.js";
import { UsersClient } from "../resources/users/client/Client.js";
export declare namespace NullTypeClient {
    type Options = BaseClientOptions;
}
export declare class NullTypeClient {
    protected readonly _options: NormalizedClientOptions<NullTypeClient.Options>;
    protected _conversations: ConversationsClient | undefined;
    protected _users: UsersClient | undefined;
    constructor(options: NullTypeClient.Options);
    get conversations(): ConversationsClient;
    get users(): UsersClient;
}
