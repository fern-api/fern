import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { OrganizationsClient } from "../resources/organizations/client/Client.mjs";
import { UserClient } from "../resources/user/client/Client.mjs";
export declare namespace PathParametersClient {
    type Options = BaseClientOptions;
}
export declare class PathParametersClient {
    protected readonly _options: NormalizedClientOptions<PathParametersClient.Options>;
    protected _organizations: OrganizationsClient | undefined;
    protected _user: UserClient | undefined;
    constructor(options: PathParametersClient.Options);
    get organizations(): OrganizationsClient;
    get user(): UserClient;
}
