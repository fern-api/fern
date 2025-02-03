namespace SeedTrace;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
public class UnauthorizedError(object body) : SeedTraceApiException("UnauthorizedError", 401, body);
