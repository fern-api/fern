namespace SeedApi;

public partial interface IUserClient
{
    WithRawResponseTask<User> GetusernameAsync(
        UserGetUsernameRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
