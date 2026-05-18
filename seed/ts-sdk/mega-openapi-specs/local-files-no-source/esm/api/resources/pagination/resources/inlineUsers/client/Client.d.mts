import type { BaseClientOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import { InlineUsersClient as InlineUsersClient_ } from "../resources/inlineUsers/client/Client.mjs";
export declare namespace InlineUsersClient {
    type Options = BaseClientOptions;
}
export declare class InlineUsersClient {
    protected readonly _options: NormalizedClientOptions<InlineUsersClient.Options>;
    protected _inlineUsers: InlineUsersClient_ | undefined;
    constructor(options: InlineUsersClient.Options);
    get inlineUsers(): InlineUsersClient_;
}
