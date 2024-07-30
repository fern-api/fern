using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record GenericCreateProblemError
{
    [JsonPropertyName("message")]
    public required string Message { get; }

    [JsonPropertyName("type")]
    public required string Type { get; }

    [JsonPropertyName("stacktrace")]
    public required string Stacktrace { get; }
}
