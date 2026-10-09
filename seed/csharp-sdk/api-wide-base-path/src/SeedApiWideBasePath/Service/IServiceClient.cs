namespace SeedApiWideBasePath;

public partial interface IServiceClient
{
    WithRawResponseTask PostAsync(
        string pathParam,
        string serviceParam,
        int endpointParam,
        string resourceParam,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
