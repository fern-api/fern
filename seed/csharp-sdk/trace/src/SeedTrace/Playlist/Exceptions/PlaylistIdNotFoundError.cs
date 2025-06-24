namespace SeedTrace;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
[Serializable]
public class PlaylistIdNotFoundError(PlaylistIdNotFoundErrorBody body)
    : SeedTraceApiException("PlaylistIdNotFoundError", 404, body)
{
    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public new PlaylistIdNotFoundErrorBody Body => body;
}
