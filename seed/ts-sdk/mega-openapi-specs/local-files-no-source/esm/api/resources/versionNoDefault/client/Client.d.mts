import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { UserClient } from "../resources/user/client/Client.mjs";
export declare namespace VersionNoDefaultClient {
    type Options = BaseClientOptions;
}
export declare class VersionNoDefaultClient {
    protected readonly _options: NormalizedClientOptions<VersionNoDefaultClient.Options>;
    protected _user: UserClient | undefined;
    constructor(options: VersionNoDefaultClient.Options);
    get user(): UserClient;
}
