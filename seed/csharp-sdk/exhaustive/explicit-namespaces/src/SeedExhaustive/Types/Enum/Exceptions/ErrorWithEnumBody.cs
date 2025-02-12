using SeedExhaustive;

namespace SeedExhaustive.Types.Enum;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
public class ErrorWithEnumBody(WeatherReport body)
    : SeedExhaustiveApiException("ErrorWithEnumBody", 400, body)
{
    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public new WeatherReport Body => body;
}
