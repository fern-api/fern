namespace SeedApi;

public partial interface ISeedApiClient
{
    Task<Foo> GetFooAsync(
        GetFooRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<Foo> UpdateFooAsync(
        string id,
        UpdateFooRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
