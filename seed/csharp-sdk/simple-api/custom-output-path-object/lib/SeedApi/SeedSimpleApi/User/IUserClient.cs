namespace SeedSimpleApi;

public partial interface IUserClient
{
    Task<User> GetAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
