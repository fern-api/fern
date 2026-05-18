import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace ServiceClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ServiceClient {
    protected readonly _options: NormalizedClientOptions<ServiceClient.Options>;
    constructor(options: ServiceClient.Options);
    /**
     * List resources with pagination
     *
     * @param {SeedApi.clientSideParams.ListResourcesServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.clientSideParams.service.listResources({
     *         page: 1,
     *         per_page: 1,
     *         sort: "sort",
     *         order: "order",
     *         include_totals: true
     *     })
     */
    listResources(request: SeedApi.clientSideParams.ListResourcesServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.clientSideParams.Resource[]>;
    private __listResources;
    /**
     * Get a single resource
     *
     * @param {SeedApi.clientSideParams.GetResourceServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.clientSideParams.service.getResource({
     *         resourceId: "resourceId",
     *         include_metadata: true,
     *         format: "format"
     *     })
     */
    getResource(request: SeedApi.clientSideParams.GetResourceServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.clientSideParams.Resource>;
    private __getResource;
    /**
     * Search resources with complex parameters
     *
     * @param {SeedApi.clientSideParams.SearchResourcesServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.clientSideParams.service.searchResources({
     *         limit: 1,
     *         offset: 1
     *     })
     */
    searchResources(request: SeedApi.clientSideParams.SearchResourcesServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.clientSideParams.SearchResponse>;
    private __searchResources;
    /**
     * List or search for users
     *
     * @param {SeedApi.clientSideParams.ListUsersServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.clientSideParams.service.listUsers()
     */
    listUsers(request?: SeedApi.clientSideParams.ListUsersServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.clientSideParams.PaginatedUserResponse>;
    private __listUsers;
    /**
     * Create a new user
     *
     * @param {SeedApi.clientSideParams.CreateUserRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.clientSideParams.service.createUser({
     *         email: "email",
     *         connection: "connection"
     *     })
     */
    createUser(request: SeedApi.clientSideParams.CreateUserRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.clientSideParams.User>;
    private __createUser;
    /**
     * Get a user by ID
     *
     * @param {SeedApi.clientSideParams.GetUserByIdServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.clientSideParams.service.getUserById({
     *         userId: "userId"
     *     })
     */
    getUserById(request: SeedApi.clientSideParams.GetUserByIdServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.clientSideParams.User>;
    private __getUserById;
    /**
     * Delete a user
     *
     * @param {SeedApi.clientSideParams.DeleteUserServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.clientSideParams.service.deleteUser({
     *         userId: "userId"
     *     })
     */
    deleteUser(request: SeedApi.clientSideParams.DeleteUserServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __deleteUser;
    /**
     * Update a user
     *
     * @param {SeedApi.clientSideParams.UpdateUserRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.clientSideParams.service.updateUser({
     *         userId: "userId"
     *     })
     */
    updateUser(request: SeedApi.clientSideParams.UpdateUserRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.clientSideParams.User>;
    private __updateUser;
    /**
     * List all connections
     *
     * @param {SeedApi.clientSideParams.ListConnectionsServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.clientSideParams.service.listConnections()
     */
    listConnections(request?: SeedApi.clientSideParams.ListConnectionsServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.clientSideParams.Connection[]>;
    private __listConnections;
    /**
     * Get a connection by ID
     *
     * @param {SeedApi.clientSideParams.GetConnectionServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.clientSideParams.service.getConnection({
     *         connectionId: "connectionId"
     *     })
     */
    getConnection(request: SeedApi.clientSideParams.GetConnectionServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.clientSideParams.Connection>;
    private __getConnection;
    /**
     * List all clients/applications
     *
     * @param {SeedApi.clientSideParams.ListClientsServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.clientSideParams.service.listClients()
     */
    listClients(request?: SeedApi.clientSideParams.ListClientsServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.clientSideParams.PaginatedClientResponse>;
    private __listClients;
    /**
     * Get a client by ID
     *
     * @param {SeedApi.clientSideParams.GetClientServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.clientSideParams.service.getClient({
     *         clientId: "clientId"
     *     })
     */
    getClient(request: SeedApi.clientSideParams.GetClientServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.clientSideParams.Client>;
    private __getClient;
}
