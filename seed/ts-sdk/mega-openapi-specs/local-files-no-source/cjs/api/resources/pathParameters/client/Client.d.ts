import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { OrganizationsClient } from "../resources/organizations/client/Client.js";
import { UserClient } from "../resources/user/client/Client.js";
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
