namespace SeedApi;

public partial interface IServiceClient
{
    /// <summary>
    /// List resources with pagination
    /// </summary>
    WithRawResponseTask<IEnumerable<Resource>> ListresourcesAsync(
        ServiceListResourcesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Get a single resource
    /// </summary>
    WithRawResponseTask<Resource> GetresourceAsync(
        ServiceGetResourceRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Search resources with complex parameters
    /// </summary>
    WithRawResponseTask<SearchResponse> SearchresourcesAsync(
        ServiceSearchResourcesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// List or search for users
    /// </summary>
    WithRawResponseTask<PaginatedUserResponse> ListusersAsync(
        ServiceListUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Create a new user
    /// </summary>
    WithRawResponseTask<User> CreateuserAsync(
        CreateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Get a user by ID
    /// </summary>
    WithRawResponseTask<User> GetuserbyidAsync(
        ServiceGetUserByIdRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Delete a user
    /// </summary>
    Task DeleteuserAsync(
        ServiceDeleteUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Update a user
    /// </summary>
    WithRawResponseTask<User> UpdateuserAsync(
        UpdateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// List all connections
    /// </summary>
    WithRawResponseTask<IEnumerable<Connection>> ListconnectionsAsync(
        ServiceListConnectionsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Get a connection by ID
    /// </summary>
    WithRawResponseTask<Connection> GetconnectionAsync(
        ServiceGetConnectionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// List all clients/applications
    /// </summary>
    WithRawResponseTask<PaginatedClientResponse> ListclientsAsync(
        ServiceListClientsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Get a client by ID
    /// </summary>
    WithRawResponseTask<Client> GetclientAsync(
        ServiceGetClientRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
