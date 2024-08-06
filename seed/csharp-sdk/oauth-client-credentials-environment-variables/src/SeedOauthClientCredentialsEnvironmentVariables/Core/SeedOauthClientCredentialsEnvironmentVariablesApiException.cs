using SeedOauthClientCredentialsEnvironmentVariables.Core;

#nullable enable

namespace SeedOauthClientCredentialsEnvironmentVariables.Core;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
public class SeedOauthClientCredentialsEnvironmentVariablesApiException(
    string message,
    int statusCode,
    object body
) : SeedOauthClientCredentialsEnvironmentVariablesException(message)
{
    /// <summary>
    /// The error code of the response that triggered the exception.
    /// </summary>
    public int StatusCode => statusCode;

    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public object Body => body;

    public override string ToString()
    {
        return $"SeedOauthClientCredentialsEnvironmentVariablesApiException {{ message: {Message}, statusCode: {StatusCode}, body: {Body} }}";
    }
}
