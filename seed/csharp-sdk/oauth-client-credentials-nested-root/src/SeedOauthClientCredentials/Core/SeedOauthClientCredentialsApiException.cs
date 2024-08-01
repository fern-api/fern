using SeedOauthClientCredentials.Core;

#nullable enable

namespace SeedOauthClientCredentials.Core;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
public class SeedOauthClientCredentialsApiException(string message, int statusCode, object body)
    : SeedOauthClientCredentialsException(message)
{
    /// <summary>
    /// The error code of the response that triggered the exception.
    /// </summary>
    public int StatusCode { get; } = statusCode;

    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public object Body { get; } = body;

    public override string ToString()
    {
        return $"SeedOauthClientCredentialsApiException {{ message: {Message}, statusCode: {StatusCode}, body: {Body} }}";
    }
}
