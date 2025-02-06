namespace SeedTrace;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
public class PlaylistIdNotFoundError(object body)
    : SeedTraceApiException("PlaylistIdNotFoundError", 404, body)
{
    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public new object Body => body;
}
