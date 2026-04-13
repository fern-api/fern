namespace SeedApi;

public partial interface IUserClient
{
    WithRawResponseTask<User> GetuserAsync(
        UserGetUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
