namespace SeedPathParameters;

public partial interface IUserClient
{
    Task<User> GetUserAsync(
        string tenantId,
        string userId,
        GetUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<User> CreateUserAsync(
        string tenantId,
        User request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<User> UpdateUserAsync(
        string tenantId,
        string userId,
        UpdateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<IEnumerable<User>> SearchUsersAsync(
        string tenantId,
        string userId,
        SearchUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Test endpoint with path parameter that has a text prefix (v{version})
    /// </summary>
    Task<User> GetUserMetadataAsync(
        string tenantId,
        string userId,
        int version,
        GetUserMetadataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Test endpoint with path parameters listed in different order than found in path
    /// </summary>
    Task<User> GetUserSpecificsAsync(
        string tenantId,
        string userId,
        int version,
        string thought,
        GetUserSpecificsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
