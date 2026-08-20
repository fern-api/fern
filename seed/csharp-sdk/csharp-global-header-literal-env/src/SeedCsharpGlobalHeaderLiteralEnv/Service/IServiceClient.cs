namespace SeedCsharpGlobalHeaderLiteralEnv;

public partial interface IServiceClient
{
    /// <summary>
    /// GET request with a literal version header
    /// </summary>
    WithRawResponseTask<string> GetWithLiteralVersionHeaderAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
