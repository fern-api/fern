import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace JavaOptionalQueryParamsOverloadsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class JavaOptionalQueryParamsOverloadsClient {
    protected readonly _options: NormalizedClientOptions<JavaOptionalQueryParamsOverloadsClient.Options>;
    constructor(options: JavaOptionalQueryParamsOverloadsClient.Options);
    /**
     * Get latest insurance for a user. All query params are optional.
     *
     * @param {SeedApi.javaOptionalQueryParamsOverloads.GetLatestInsuranceRequest} request
     * @param {JavaOptionalQueryParamsOverloadsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaOptionalQueryParamsOverloads.javaOptionalQueryParamsOverloads.getLatestInsurance({
     *         userId: "userId"
     *     })
     */
    getLatestInsurance(request: SeedApi.javaOptionalQueryParamsOverloads.GetLatestInsuranceRequest, requestOptions?: JavaOptionalQueryParamsOverloadsClient.RequestOptions): core.HttpResponsePromise<SeedApi.javaOptionalQueryParamsOverloads.InsurancePolicy>;
    private __getLatestInsurance;
    /**
     * Search policies with required query params
     *
     * @param {SeedApi.javaOptionalQueryParamsOverloads.SearchPoliciesRequest} request
     * @param {JavaOptionalQueryParamsOverloadsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaOptionalQueryParamsOverloads.javaOptionalQueryParamsOverloads.searchPolicies({
     *         query: "query"
     *     })
     */
    searchPolicies(request: SeedApi.javaOptionalQueryParamsOverloads.SearchPoliciesRequest, requestOptions?: JavaOptionalQueryParamsOverloadsClient.RequestOptions): core.HttpResponsePromise<SeedApi.javaOptionalQueryParamsOverloads.InsurancePolicy[]>;
    private __searchPolicies;
    /**
     * List all policies
     *
     * @param {JavaOptionalQueryParamsOverloadsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaOptionalQueryParamsOverloads.javaOptionalQueryParamsOverloads.listAllPolicies()
     */
    listAllPolicies(requestOptions?: JavaOptionalQueryParamsOverloadsClient.RequestOptions): core.HttpResponsePromise<SeedApi.javaOptionalQueryParamsOverloads.InsurancePolicy[]>;
    private __listAllPolicies;
}
