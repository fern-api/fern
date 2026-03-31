namespace SeedNoRetries;

public partial interface IRetriesClient
{
    WithRawResponseTask<IEnumerable<User>> GetUsersAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
