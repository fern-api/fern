namespace SeedApi;

public partial interface IClient
{
    Task FooAsync(RequestOptions? options = null, CancellationToken cancellationToken = default);
}
