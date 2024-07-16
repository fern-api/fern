using System.Text.Json.Serialization;

#nullable enable

namespace SeedExamples;

public record ExceptionInfo
{
    [JsonPropertyName("exceptionType")]
    public required string ExceptionType { get; init; }

    [JsonPropertyName("exceptionMessage")]
    public required string ExceptionMessage { get; init; }

    [JsonPropertyName("exceptionStacktrace")]
    public required string ExceptionStacktrace { get; init; }
}
