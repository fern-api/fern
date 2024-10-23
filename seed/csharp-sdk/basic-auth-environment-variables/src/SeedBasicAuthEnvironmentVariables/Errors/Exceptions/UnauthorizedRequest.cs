namespace SeedBasicAuthEnvironmentVariables;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
public class UnauthorizedRequest(UnauthorizedRequestErrorBody body)
    : SeedBasicAuthEnvironmentVariablesApiException("UnauthorizedRequest", 401, body)
{
    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public new UnauthorizedRequestErrorBody Body => body;
}
