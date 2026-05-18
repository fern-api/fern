import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ConversationsClient } from "../resources/conversations/client/Client.mjs";
import { UsersClient } from "../resources/users/client/Client.mjs";
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
