namespace SeedApi;

public partial interface IPetsClient
{
    WithRawResponseTask<IEnumerable<string>> ListAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
