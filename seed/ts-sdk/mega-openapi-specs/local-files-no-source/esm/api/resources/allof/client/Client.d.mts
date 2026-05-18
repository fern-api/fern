import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import * as core from "../../../../core/index.mjs";
import type * as SeedApi from "../../../index.mjs";
export declare namespace AllofClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class AllofClient {
    protected readonly _options: NormalizedClientOptions<AllofClient.Options>;
    constructor(options: AllofClient.Options);
    /**
     * @param {SeedApi.allof.SearchRuleTypesRequest} request
     * @param {AllofClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.allof.searchRuleTypes()
     */
    searchRuleTypes(request?: SeedApi.allof.SearchRuleTypesRequest, requestOptions?: AllofClient.RequestOptions): core.HttpResponsePromise<SeedApi.allof.RuleTypeSearchResponse>;
    private __searchRuleTypes;
    /**
     * @param {SeedApi.allof.RuleCreateRequest} request
     * @param {AllofClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.allof.createRule({
     *         name: "name",
     *         executionContext: "prod"
     *     })
     */
    createRule(request: SeedApi.allof.RuleCreateRequest, requestOptions?: AllofClient.RequestOptions): core.HttpResponsePromise<SeedApi.allof.RuleResponse>;
    private __createRule;
    /**
     * @param {AllofClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.allof.listUsers()
     */
    listUsers(requestOptions?: AllofClient.RequestOptions): core.HttpResponsePromise<SeedApi.allof.UserSearchResponse>;
    private __listUsers;
    /**
     * @param {AllofClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.allof.getEntity()
     */
    getEntity(requestOptions?: AllofClient.RequestOptions): core.HttpResponsePromise<SeedApi.allof.CombinedEntity>;
    private __getEntity;
    /**
     * @param {AllofClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.allof.getOrganization()
     */
    getOrganization(requestOptions?: AllofClient.RequestOptions): core.HttpResponsePromise<SeedApi.allof.Organization>;
    private __getOrganization;
}
