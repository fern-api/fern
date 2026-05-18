import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace OrganizationClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class OrganizationClient {
    protected readonly _options: NormalizedClientOptions<OrganizationClient.Options>;
    constructor(options: OrganizationClient.Options);
    /**
     * Create a new organization.
     *
     * @param {SeedApi.mixedFileDirectory.CreateOrganizationRequest} request
     * @param {OrganizationClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.mixedFileDirectory.organization.create({
     *         name: "name"
     *     })
     */
    create(request: SeedApi.mixedFileDirectory.CreateOrganizationRequest, requestOptions?: OrganizationClient.RequestOptions): core.HttpResponsePromise<SeedApi.mixedFileDirectory.Organization>;
    private __create;
}
