namespace SeedApi;

public partial interface IClient
{
    WithRawResponseTask<Foo> GetFooAsync(
        GetFooRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Foo> UpdateFooAsync(
        UpdateFooRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
