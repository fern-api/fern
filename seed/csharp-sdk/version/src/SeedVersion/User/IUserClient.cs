namespace SeedVersion;

public partial interface IUserClient
{
    WithRawResponseTask<User> GetUserAsync(
        string userId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
