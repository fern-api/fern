namespace SeedBasicAuth;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
public class BadRequest(object body) : SeedBasicAuthApiException("BadRequest", 400, body);
