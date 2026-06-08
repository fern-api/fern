namespace SeedPathParameters;

public partial interface IEndpointHeadersClient
{
    /// <summary>
    /// Endpoint with only path parameters and endpoint-level headers but NO service-level headers. The wrapper should NOT be elided because it holds the endpoint header field.
    /// </summary>
    WithRawResponseTask<User> GetEndpointHeadersPathParamAsync(
        GetEndpointHeadersPathParamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
