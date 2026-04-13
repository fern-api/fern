namespace SeedApi;

public partial interface IAbClient
{
    Task ABFooAsync(RequestOptions? options = null, CancellationToken cancellationToken = default);
}
