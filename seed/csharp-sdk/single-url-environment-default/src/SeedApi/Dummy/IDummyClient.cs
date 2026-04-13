namespace SeedApi;

public partial interface IDummyClient
{
    WithRawResponseTask<string> GetdummyAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
