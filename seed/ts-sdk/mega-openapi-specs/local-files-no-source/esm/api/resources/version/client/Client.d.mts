import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { UserClient } from "../resources/user/client/Client.mjs";
export declare namespace VersionClient {
    type Options = BaseClientOptions;
}
export declare class VersionClient {
    protected readonly _options: NormalizedClientOptions<VersionClient.Options>;
    protected _user: UserClient | undefined;
    constructor(options: VersionClient.Options);
    get user(): UserClient;
}
