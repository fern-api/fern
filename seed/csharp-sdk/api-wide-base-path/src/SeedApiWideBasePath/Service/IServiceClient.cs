namespace SeedApiWideBasePath;

public partial interface IServiceClient
{
    Task PostAsync(
        string pathParam,
        string serviceParam,
        int endpointParam,
        string resourceParam,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
