namespace SeedCustomAuth;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
public class SeedCustomAuthApiException(string message, int statusCode, object body)
    : SeedCustomAuthException(message)
{
    /// <summary>
    /// The error code of the response that triggered the exception.
    /// </summary>
    public int StatusCode => statusCode;

    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public object Body => body;
}
