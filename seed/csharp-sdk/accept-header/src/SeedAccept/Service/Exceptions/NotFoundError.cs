namespace SeedAccept;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
[Serializable]
public class NotFoundError(object body) : SeedAcceptApiException("NotFoundError", 404, body);
