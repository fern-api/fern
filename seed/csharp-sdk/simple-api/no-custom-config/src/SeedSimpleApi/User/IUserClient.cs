namespace SeedSimpleApi;

public partial interface IUserClient
{
    WithRawResponseTask<User> GetAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
