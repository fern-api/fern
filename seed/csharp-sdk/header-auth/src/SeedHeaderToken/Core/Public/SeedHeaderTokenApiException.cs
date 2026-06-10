namespace SeedHeaderToken;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
public class SeedHeaderTokenApiException(
    string message,
    int statusCode,
    object body,
    Exception? innerException = null,
    SeedHeaderToken.RawResponse? rawResponse = null
) : SeedHeaderTokenException(message, innerException)
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
    public SeedHeaderToken.RawResponse? RawResponse => rawResponse;
}
