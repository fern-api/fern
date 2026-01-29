namespace SeedQueryParameters;

public partial interface IUserClient
{
    WithRawResponseTask<User> GetUsernameAsync(
        GetUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
