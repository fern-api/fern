using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record ExceptionInfo
{
    [JsonPropertyName("exceptionType")]
    public required string ExceptionType { get; set; }

    [JsonPropertyName("exceptionMessage")]
    public required string ExceptionMessage { get; set; }

    [JsonPropertyName("exceptionStacktrace")]
    public required string ExceptionStacktrace { get; set; }
}
