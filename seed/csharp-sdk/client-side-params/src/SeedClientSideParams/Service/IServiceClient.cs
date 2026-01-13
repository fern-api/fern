namespace SeedClientSideParams;

public partial interface IServiceClient
{
    /// <summary>
    /// List resources with pagination
    /// </summary>
    Task<IEnumerable<Resource>> ListResourcesAsync(
        ListResourcesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Get a single resource
    /// </summary>
    Task<Resource> GetResourceAsync(
        string resourceId,
        GetResourceRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Search resources with complex parameters
    /// </summary>
    Task<SearchResponse> SearchResourcesAsync(
        SearchResourcesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// List or search for users
    /// </summary>
    Task<PaginatedUserResponse> ListUsersAsync(
        ListUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Get a user by ID
    /// </summary>
    Task<User> GetUserByIdAsync(
        string userId,
        GetUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Create a new user
    /// </summary>
    Task<User> CreateUserAsync(
        CreateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Update a user
    /// </summary>
    Task<User> UpdateUserAsync(
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
    Task<IEnumerable<Connection>> ListConnectionsAsync(
        ListConnectionsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Get a connection by ID
    /// </summary>
    Task<Connection> GetConnectionAsync(
        string connectionId,
        GetConnectionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// List all clients/applications
    /// </summary>
    Task<PaginatedClientResponse> ListClientsAsync(
        ListClientsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Get a client by ID
    /// </summary>
    Task<Client> GetClientAsync(
        string clientId,
        GetClientRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
