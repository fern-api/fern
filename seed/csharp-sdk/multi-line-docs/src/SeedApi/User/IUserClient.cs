namespace SeedApi;

public partial interface IUserClient
{
    /// <summary>
    /// Retrieve a user.
    /// This endpoint is used to retrieve a user.
    /// </summary>
    Task GetuserAsync(
        UserGetUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Create a new user.
    /// This endpoint is used to create a new user.
    /// </summary>
    WithRawResponseTask<User> CreateuserAsync(
        UserCreateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
