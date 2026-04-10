namespace SeedApi;

public partial interface INestedNoAuthApiClient
{
    Task NestedNoAuthApiGetSomethingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
