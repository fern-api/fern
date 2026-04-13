namespace SeedApi;

public partial interface IUserClient
{
    WithRawResponseTask<User> GetAsync(
        UserGetRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
