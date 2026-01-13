namespace SeedNoRetries;

public partial interface IRetriesClient
{
    Task<IEnumerable<User>> GetUsersAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
