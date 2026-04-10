namespace SeedApi;

public partial interface ISimpleClient
{
    Task GetsomethingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
