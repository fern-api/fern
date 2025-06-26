namespace SeedCustomAuth;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
[Serializable]
public class BadRequest(object body) : SeedCustomAuthApiException("BadRequest", 400, body);
