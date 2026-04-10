namespace SeedApi;

public partial interface IRetriesClient
{
    WithRawResponseTask<IEnumerable<User>> GetusersAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
