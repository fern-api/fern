import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { UserClient } from "../resources/user/client/Client.js";
export declare namespace VersionNoDefaultClient {
    type Options = BaseClientOptions;
}
export declare class VersionNoDefaultClient {
    protected readonly _options: NormalizedClientOptions<VersionNoDefaultClient.Options>;
    protected _user: UserClient | undefined;
    constructor(options: VersionNoDefaultClient.Options);
    get user(): UserClient;
}
