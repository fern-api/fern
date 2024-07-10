using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record ExecutionSessionResponse
{
    [JsonPropertyName("sessionId")]
    public required string SessionId { get; init; }

    [JsonPropertyName("executionSessionUrl")]
    public string? ExecutionSessionUrl { get; init; }

    [JsonPropertyName("language")]
    public required Language Language { get; init; }

    [JsonPropertyName("status")]
    public required ExecutionSessionStatus Status { get; init; }
}
