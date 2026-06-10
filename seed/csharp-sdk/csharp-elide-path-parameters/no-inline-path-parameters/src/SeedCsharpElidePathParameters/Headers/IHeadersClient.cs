namespace SeedCsharpElidePathParameters;

public partial interface IHeadersClient
{
    /// <summary>
    /// Endpoint with only path parameters but service-level headers. The wrapper should NOT be elided because it holds the service header field.
    /// </summary>
    WithRawResponseTask<User> GetHeadersPathParamAsync(
        string headerId,
        GetHeadersPathParamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Endpoint with path parameter + body + service-level headers. The wrapper should NOT be unwrapped because of service headers.
    /// </summary>
    WithRawResponseTask<User> GetHeadersPathParamBodyAsync(
        string headerId,
        GetHeadersPathParamBodyRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
