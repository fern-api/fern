namespace SeedApi;

public partial interface IClient
{
    Task GetAsync(
        GetRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
