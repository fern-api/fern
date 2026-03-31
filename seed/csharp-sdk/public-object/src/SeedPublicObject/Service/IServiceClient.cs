namespace SeedPublicObject;

public partial interface IServiceClient
{
    WithRawResponseTask<global::System.IO.Stream> GetAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
