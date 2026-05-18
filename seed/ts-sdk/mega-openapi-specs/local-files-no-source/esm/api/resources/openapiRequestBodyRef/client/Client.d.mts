import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { CatalogClient } from "../resources/catalog/client/Client.mjs";
import { TeamMemberClient } from "../resources/teamMember/client/Client.mjs";
import { VendorClient } from "../resources/vendor/client/Client.mjs";
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
