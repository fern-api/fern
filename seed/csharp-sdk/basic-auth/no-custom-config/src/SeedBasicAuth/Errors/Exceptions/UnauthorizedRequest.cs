namespace SeedBasicAuth;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
[Serializable]
public class UnauthorizedRequest(
    UnauthorizedRequestErrorBody body,
    SeedBasicAuth.RawResponse? rawResponse = null
) : SeedBasicAuthApiException("UnauthorizedRequest", 401, body, rawResponse: rawResponse)
{
    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public new UnauthorizedRequestErrorBody Body => body;
}
