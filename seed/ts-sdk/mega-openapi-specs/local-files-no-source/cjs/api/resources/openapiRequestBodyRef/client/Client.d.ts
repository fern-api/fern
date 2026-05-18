import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { CatalogClient } from "../resources/catalog/client/Client.js";
import { TeamMemberClient } from "../resources/teamMember/client/Client.js";
import { VendorClient } from "../resources/vendor/client/Client.js";
export declare namespace OpenapiRequestBodyRefClient {
    type Options = BaseClientOptions;
}
export declare class OpenapiRequestBodyRefClient {
    protected readonly _options: NormalizedClientOptions<OpenapiRequestBodyRefClient.Options>;
    protected _vendor: VendorClient | undefined;
    protected _catalog: CatalogClient | undefined;
    protected _teamMember: TeamMemberClient | undefined;
    constructor(options: OpenapiRequestBodyRefClient.Options);
    get vendor(): VendorClient;
    get catalog(): CatalogClient;
    get teamMember(): TeamMemberClient;
}
