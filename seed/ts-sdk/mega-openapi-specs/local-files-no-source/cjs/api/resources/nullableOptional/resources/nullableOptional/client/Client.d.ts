import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace NullableOptionalClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class NullableOptionalClient {
    protected readonly _options: NormalizedClientOptions<NullableOptionalClient.Options>;
    constructor(options: NullableOptionalClient.Options);
    /**
     * Get a user by ID
     *
     * @param {SeedApi.nullableOptional.GetUserNullableOptionalRequest} request
     * @param {NullableOptionalClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.nullableOptional.nullableOptional.getUser({
     *         userId: "userId"
     *     })
     */
    getUser(request: SeedApi.nullableOptional.GetUserNullableOptionalRequest, requestOptions?: NullableOptionalClient.RequestOptions): core.HttpResponsePromise<SeedApi.nullableOptional.UserResponse>;
    private __getUser;
    /**
     * Update a user (partial update)
     *
     * @param {SeedApi.nullableOptional.UpdateUserRequest} request
     * @param {NullableOptionalClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.nullableOptional.nullableOptional.updateUser({
     *         userId: "userId"
     *     })
     */
    updateUser(request: SeedApi.nullableOptional.UpdateUserRequest, requestOptions?: NullableOptionalClient.RequestOptions): core.HttpResponsePromise<SeedApi.nullableOptional.UserResponse>;
    private __updateUser;
    /**
     * List all users
     *
     * @param {SeedApi.nullableOptional.ListUsersNullableOptionalRequest} request
     * @param {NullableOptionalClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.nullableOptional.nullableOptional.listUsers()
     */
    listUsers(request?: SeedApi.nullableOptional.ListUsersNullableOptionalRequest, requestOptions?: NullableOptionalClient.RequestOptions): core.HttpResponsePromise<SeedApi.nullableOptional.UserResponse[]>;
    private __listUsers;
    /**
     * Create a new user
     *
     * @param {SeedApi.nullableOptional.CreateUserRequest} request
     * @param {NullableOptionalClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.nullableOptional.nullableOptional.createUser({
     *         username: "username"
     *     })
     */
    createUser(request: SeedApi.nullableOptional.CreateUserRequest, requestOptions?: NullableOptionalClient.RequestOptions): core.HttpResponsePromise<SeedApi.nullableOptional.UserResponse>;
    private __createUser;
    /**
     * Search users
     *
     * @param {SeedApi.nullableOptional.SearchUsersNullableOptionalRequest} request
     * @param {NullableOptionalClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.nullableOptional.nullableOptional.searchUsers({
     *         query: "query",
     *         department: "department"
     *     })
     */
    searchUsers(request: SeedApi.nullableOptional.SearchUsersNullableOptionalRequest, requestOptions?: NullableOptionalClient.RequestOptions): core.HttpResponsePromise<SeedApi.nullableOptional.UserResponse[]>;
    private __searchUsers;
    /**
     * Create a complex profile to test nullable enums and unions
     *
     * @param {SeedApi.nullableOptional.ComplexProfile} request
     * @param {NullableOptionalClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.nullableOptional.nullableOptional.createComplexProfile({
     *         id: "id"
     *     })
     */
    createComplexProfile(request: SeedApi.nullableOptional.ComplexProfile, requestOptions?: NullableOptionalClient.RequestOptions): core.HttpResponsePromise<SeedApi.nullableOptional.ComplexProfile>;
    private __createComplexProfile;
    /**
     * Get a complex profile by ID
     *
     * @param {SeedApi.nullableOptional.GetComplexProfileNullableOptionalRequest} request
     * @param {NullableOptionalClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.nullableOptional.nullableOptional.getComplexProfile({
     *         profileId: "profileId"
     *     })
     */
    getComplexProfile(request: SeedApi.nullableOptional.GetComplexProfileNullableOptionalRequest, requestOptions?: NullableOptionalClient.RequestOptions): core.HttpResponsePromise<SeedApi.nullableOptional.ComplexProfile>;
    private __getComplexProfile;
    /**
     * Update complex profile to test nullable field updates
     *
     * @param {SeedApi.nullableOptional.UpdateComplexProfileNullableOptionalRequest} request
     * @param {NullableOptionalClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.nullableOptional.nullableOptional.updateComplexProfile({
     *         profileId: "profileId"
     *     })
     */
    updateComplexProfile(request: SeedApi.nullableOptional.UpdateComplexProfileNullableOptionalRequest, requestOptions?: NullableOptionalClient.RequestOptions): core.HttpResponsePromise<SeedApi.nullableOptional.ComplexProfile>;
    private __updateComplexProfile;
    /**
     * Test endpoint for validating null deserialization
     *
     * @param {SeedApi.nullableOptional.DeserializationTestRequest} request
     * @param {NullableOptionalClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.nullableOptional.nullableOptional.testDeserialization({
     *         requiredString: "requiredString"
     *     })
     */
    testDeserialization(request: SeedApi.nullableOptional.DeserializationTestRequest, requestOptions?: NullableOptionalClient.RequestOptions): core.HttpResponsePromise<SeedApi.nullableOptional.DeserializationTestResponse>;
    private __testDeserialization;
    /**
     * Filter users by role with nullable enum
     *
     * @param {SeedApi.nullableOptional.FilterByRoleNullableOptionalRequest} request
     * @param {NullableOptionalClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.nullableOptional.nullableOptional.filterByRole({
     *         role: "ADMIN"
     *     })
     */
    filterByRole(request: SeedApi.nullableOptional.FilterByRoleNullableOptionalRequest, requestOptions?: NullableOptionalClient.RequestOptions): core.HttpResponsePromise<SeedApi.nullableOptional.UserResponse[]>;
    private __filterByRole;
    /**
     * Get notification settings which may be null
     *
     * @param {SeedApi.nullableOptional.GetNotificationSettingsNullableOptionalRequest} request
     * @param {NullableOptionalClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.nullableOptional.nullableOptional.getNotificationSettings({
     *         userId: "userId"
     *     })
     */
    getNotificationSettings(request: SeedApi.nullableOptional.GetNotificationSettingsNullableOptionalRequest, requestOptions?: NullableOptionalClient.RequestOptions): core.HttpResponsePromise<SeedApi.nullableOptional.NotificationMethod | null>;
    private __getNotificationSettings;
    /**
     * Update tags to test array handling
     *
     * @param {SeedApi.nullableOptional.UpdateTagsNullableOptionalRequest} request
     * @param {NullableOptionalClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.nullableOptional.nullableOptional.updateTags({
     *         userId: "userId"
     *     })
     */
    updateTags(request: SeedApi.nullableOptional.UpdateTagsNullableOptionalRequest, requestOptions?: NullableOptionalClient.RequestOptions): core.HttpResponsePromise<string[]>;
    private __updateTags;
    /**
     * Get search results with nullable unions
     *
     * @param {SeedApi.nullableOptional.GetSearchResultsNullableOptionalRequest} request
     * @param {NullableOptionalClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.nullableOptional.nullableOptional.getSearchResults({
     *         query: "query"
     *     })
     */
    getSearchResults(request: SeedApi.nullableOptional.GetSearchResultsNullableOptionalRequest, requestOptions?: NullableOptionalClient.RequestOptions): core.HttpResponsePromise<SeedApi.nullableOptional.SearchResult[] | null>;
    private __getSearchResults;
}
