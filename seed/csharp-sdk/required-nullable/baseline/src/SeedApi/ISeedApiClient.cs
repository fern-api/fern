namespace SeedApi;

public partial interface ISeedApiClient
{
    WithRawResponseTask<Foo> GetFooAsync(
        GetFooRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Foo> UpdateFooAsync(
        string id,
        UpdateFooRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
