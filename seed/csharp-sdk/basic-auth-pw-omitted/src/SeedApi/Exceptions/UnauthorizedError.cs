namespace SeedApi;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
[Serializable]
public class UnauthorizedError(UnauthorizedRequestErrorBody body)
    : SeedApiApiException("UnauthorizedError", 401, body)
{
    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public new UnauthorizedRequestErrorBody Body => body;
}
