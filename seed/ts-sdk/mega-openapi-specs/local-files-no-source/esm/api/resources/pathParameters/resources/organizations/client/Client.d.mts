import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace OrganizationsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class OrganizationsClient {
    protected readonly _options: NormalizedClientOptions<OrganizationsClient.Options>;
    constructor(options: OrganizationsClient.Options);
    /**
     * @param {SeedApi.pathParameters.GetOrganizationOrganizationsRequest} request
     * @param {OrganizationsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pathParameters.organizations.getOrganization({
     *         tenant_id: "tenant_id",
     *         organization_id: "organization_id"
     *     })
     */
    getOrganization(request: SeedApi.pathParameters.GetOrganizationOrganizationsRequest, requestOptions?: OrganizationsClient.RequestOptions): core.HttpResponsePromise<SeedApi.pathParameters.Organization>;
    private __getOrganization;
    /**
     * @param {SeedApi.pathParameters.GetOrganizationUserOrganizationsRequest} request
     * @param {OrganizationsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pathParameters.organizations.getOrganizationUser({
     *         tenant_id: "tenant_id",
     *         organization_id: "organization_id",
     *         user_id: "user_id"
     *     })
     */
    getOrganizationUser(request: SeedApi.pathParameters.GetOrganizationUserOrganizationsRequest, requestOptions?: OrganizationsClient.RequestOptions): core.HttpResponsePromise<SeedApi.pathParameters.User>;
    private __getOrganizationUser;
    /**
     * @param {SeedApi.pathParameters.SearchOrganizationsOrganizationsRequest} request
     * @param {OrganizationsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pathParameters.organizations.searchOrganizations({
     *         tenant_id: "tenant_id",
     *         organization_id: "organization_id"
     *     })
     */
    searchOrganizations(request: SeedApi.pathParameters.SearchOrganizationsOrganizationsRequest, requestOptions?: OrganizationsClient.RequestOptions): core.HttpResponsePromise<SeedApi.pathParameters.Organization[]>;
    private __searchOrganizations;
}
