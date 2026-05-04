namespace SeedBasicAuthPwOmitted;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
[Serializable]
public class BadRequest(object body) : SeedBasicAuthPwOmittedApiException("BadRequest", 400, body);
