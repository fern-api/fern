namespace SeedClientSideParams;

public partial interface IServiceClient
{
    /// <summary>
    /// List resources with pagination
    /// </summary>
    WithRawResponseTask<IEnumerable<Resource>> ListResourcesAsync(
        ListResourcesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Get a single resource
    /// </summary>
    WithRawResponseTask<Resource> GetResourceAsync(
        string resourceId,
        GetResourceRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Search resources with complex parameters
    /// </summary>
    WithRawResponseTask<SearchResponse> SearchResourcesAsync(
        SearchResourcesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// List or search for users
    /// </summary>
    WithRawResponseTask<PaginatedUserResponse> ListUsersAsync(
        ListUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Get a user by ID
    /// </summary>
    WithRawResponseTask<User> GetUserByIdAsync(
        string userId,
        GetUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Create a new user
    /// </summary>
    WithRawResponseTask<User> CreateUserAsync(
        CreateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Update a user
    /// </summary>
    WithRawResponseTask<User> UpdateUserAsync(
        string userId,
        UpdateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Delete a user
    /// </summary>
    Task DeleteUserAsync(
        string userId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// List all connections
    /// </summary>
    WithRawResponseTask<IEnumerable<Connection>> ListConnectionsAsync(
        ListConnectionsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Get a connection by ID
    /// </summary>
    WithRawResponseTask<Connection> GetConnectionAsync(
        string connectionId,
        GetConnectionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// List all clients/applications
    /// </summary>
    WithRawResponseTask<PaginatedClientResponse> ListClientsAsync(
        ListClientsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Get a client by ID
    /// </summary>
    WithRawResponseTask<Client> GetClientAsync(
        string clientId,
        GetClientRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
