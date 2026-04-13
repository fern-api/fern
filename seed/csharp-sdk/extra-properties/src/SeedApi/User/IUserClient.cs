namespace SeedApi;

public partial interface IUserClient
{
    WithRawResponseTask<User> CreateuserAsync(
        UserCreateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
