namespace SeedApi;

public partial interface INestedApiClient
{
    Task NestedApiGetSomethingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
