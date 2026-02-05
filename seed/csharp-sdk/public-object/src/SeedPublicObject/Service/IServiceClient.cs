namespace SeedPublicObject;

public partial interface IServiceClient
{
    WithRawResponseTask<System.IO.Stream> GetAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
