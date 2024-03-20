using System.Text.Json.Serialization

namespace SeedExamplesClient

public class ExceptionInfo
{
    [JsonPropertyName("exceptionType")]
    public string ExceptionType { get; init; }

    [JsonPropertyName("exceptionMessage")]
    public string ExceptionMessage { get; init; }

    [JsonPropertyName("exceptionStacktrace")]
    public string ExceptionStacktrace { get; init; }
}
