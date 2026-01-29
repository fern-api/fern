namespace SeedApi;

public partial interface IDataserviceClient
{
    WithRawResponseTask<Dictionary<string, object?>> FooAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
