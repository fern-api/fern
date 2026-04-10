namespace SeedApi;

public partial interface IClient
{
    Task GetAsync(RequestOptions? options = null, CancellationToken cancellationToken = default);
}
