namespace SeedPublicObject;

public partial interface IServiceClient
{
    Task<System.IO.Stream> GetAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
