using System.Text.Json.Serialization;

#nullable enable

namespace SeedExamples;

public record ExceptionInfo
{
    [JsonPropertyName("exceptionType")]
    public required string ExceptionType { get; }

    [JsonPropertyName("exceptionMessage")]
    public required string ExceptionMessage { get; }

    [JsonPropertyName("exceptionStacktrace")]
    public required string ExceptionStacktrace { get; }
}
