namespace SeedPhpGlobalHeaderEnv;

public partial interface IServiceClient
{
    /// <summary>
    /// GET request with a version header
    /// </summary>
    WithRawResponseTask<string> GetWithApiVersionAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
