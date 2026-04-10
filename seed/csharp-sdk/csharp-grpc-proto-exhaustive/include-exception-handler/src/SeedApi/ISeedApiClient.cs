namespace SeedApi;

public partial interface ISeedApiClient
{
    public IDataServiceClient DataService { get; }
    WithRawResponseTask<Dictionary<string, object?>> PostFooAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
