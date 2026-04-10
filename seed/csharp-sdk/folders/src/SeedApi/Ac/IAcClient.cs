namespace SeedApi;

public partial interface IAcClient
{
    Task ACFooAsync(RequestOptions? options = null, CancellationToken cancellationToken = default);
}
