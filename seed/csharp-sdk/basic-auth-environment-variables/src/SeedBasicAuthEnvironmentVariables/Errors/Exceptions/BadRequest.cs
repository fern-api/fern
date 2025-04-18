namespace SeedBasicAuthEnvironmentVariables;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
public class BadRequest(object body)
    : SeedBasicAuthEnvironmentVariablesApiException("BadRequest", 400, body);
