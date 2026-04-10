namespace SeedApi;

public partial interface IBasicauthClient
{
    /// <summary>
    /// GET request with basic auth scheme
    /// </summary>
    WithRawResponseTask<bool> GetwithbasicauthAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// POST request with basic auth scheme
    /// </summary>
    WithRawResponseTask<bool> PostwithbasicauthAsync(
        object request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
