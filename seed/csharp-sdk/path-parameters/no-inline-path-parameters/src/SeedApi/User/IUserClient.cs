namespace SeedApi;

public partial interface IUserClient
{
    WithRawResponseTask<User> GetuserAsync(
        string tenantId,
        string userId,
        UserGetUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<User> UpdateuserAsync(
        string tenantId,
        string userId,
        UserUpdateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<User> CreateuserAsync(
        string tenantId,
        UserCreateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<User>> SearchusersAsync(
        string tenantId,
        string userId,
        UserSearchUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Test endpoint with path parameter that has a text prefix (v{version})
    /// </summary>
    WithRawResponseTask<User> GetusermetadataAsync(
        string tenantId,
        string userId,
        int version,
        UserGetUserMetadataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Test endpoint with path parameters listed in different order than found in path
    /// </summary>
    WithRawResponseTask<User> GetuserspecificsAsync(
        string tenantId,
        string userId,
        int version,
        string thought,
        UserGetUserSpecificsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
