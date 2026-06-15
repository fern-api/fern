namespace SeedWebsocketMultiUrl;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
public class SeedWebsocketMultiUrlApiException(
    string message,
    int statusCode,
    object body,
    Exception? innerException = null,
    SeedWebsocketMultiUrl.RawResponse? rawResponse = null
) : SeedWebsocketMultiUrlException(message, innerException)
{
    /// <summary>
    /// The error code of the response that triggered the exception.
    /// </summary>
    public int StatusCode => statusCode;

    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public object Body => body;

    /// <summary>
    /// The raw HTTP response (status code, URL, headers) that triggered the exception, if available.
    /// </summary>
    public SeedWebsocketMultiUrl.RawResponse? RawResponse => rawResponse;
}
