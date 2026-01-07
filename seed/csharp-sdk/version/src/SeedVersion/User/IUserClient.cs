namespace SeedVersion;

public partial interface IUserClient
{
    Task<User> GetUserAsync(
        string userId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
