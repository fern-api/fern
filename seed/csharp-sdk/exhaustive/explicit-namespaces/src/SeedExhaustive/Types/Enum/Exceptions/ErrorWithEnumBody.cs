using SeedExhaustive;

namespace SeedExhaustive.Types.Enum;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
[System.Serializable]
public class ErrorWithEnumBody(SeedExhaustive.Types.Enum.WeatherReport body)
    : SeedExhaustive.SeedExhaustiveApiException("ErrorWithEnumBody", 400, body)
{
    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public new SeedExhaustive.Types.Enum.WeatherReport Body => body;
}
