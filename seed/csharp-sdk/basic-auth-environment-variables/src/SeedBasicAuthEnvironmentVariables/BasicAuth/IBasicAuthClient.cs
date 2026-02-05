namespace SeedBasicAuthEnvironmentVariables;

public partial interface IBasicAuthClient
{
    /// <summary>
    /// GET request with basic auth scheme
    /// </summary>
    WithRawResponseTask<bool> GetWithBasicAuthAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// POST request with basic auth scheme
    /// </summary>
    WithRawResponseTask<bool> PostWithBasicAuthAsync(
        object request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
