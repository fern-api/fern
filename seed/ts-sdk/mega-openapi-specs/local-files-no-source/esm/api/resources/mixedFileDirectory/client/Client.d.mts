import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { OrganizationClient } from "../resources/organization/client/Client.mjs";
import { UserClient } from "../resources/user/client/Client.mjs";
export declare namespace MixedFileDirectoryClient {
    type Options = BaseClientOptions;
}
export declare class MixedFileDirectoryClient {
    protected readonly _options: NormalizedClientOptions<MixedFileDirectoryClient.Options>;
    protected _organization: OrganizationClient | undefined;
    protected _user: UserClient | undefined;
    constructor(options: MixedFileDirectoryClient.Options);
    get organization(): OrganizationClient;
    get user(): UserClient;
}
