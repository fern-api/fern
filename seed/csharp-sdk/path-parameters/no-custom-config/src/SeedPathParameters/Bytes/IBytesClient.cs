namespace SeedPathParameters;

public partial interface IBytesClient
{
    /// <summary>
    /// Endpoint with path parameter + bytes body. The wrapper should NOT be unwrapped because bytes bodies cannot be passed directly as a method parameter.
    /// </summary>
    WithRawResponseTask<User> UploadBytesAsync(
        UploadBytesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
