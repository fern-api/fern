import type { BaseClientOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import { InlineUsersClient as InlineUsersClient_ } from "../resources/inlineUsers/client/Client.js";
export declare namespace InlineUsersClient {
    type Options = BaseClientOptions;
}
export declare class InlineUsersClient {
    protected readonly _options: NormalizedClientOptions<InlineUsersClient.Options>;
    protected _inlineUsers: InlineUsersClient_ | undefined;
    constructor(options: InlineUsersClient.Options);
    get inlineUsers(): InlineUsersClient_;
}
