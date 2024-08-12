namespace SeedOauthClientCredentialsDefault;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
public class SeedOauthClientCredentialsDefaultApiException(
    string message,
    int statusCode,
    object body
) : SeedOauthClientCredentialsDefaultException(message)
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
