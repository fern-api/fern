namespace SeedApi;

public partial interface IUserClient
{
    WithRawResponseTask<User> GetuserAsync(
        UserGetUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<User> UpdateuserAsync(
        UserUpdateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<User> CreateuserAsync(
        UserCreateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<User>> SearchusersAsync(
        UserSearchUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Test endpoint with path parameter that has a text prefix (v{version})
    /// </summary>
    WithRawResponseTask<User> GetusermetadataAsync(
        UserGetUserMetadataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Test endpoint with path parameters listed in different order than found in path
    /// </summary>
    WithRawResponseTask<User> GetuserspecificsAsync(
        UserGetUserSpecificsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
