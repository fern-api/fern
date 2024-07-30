using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record ExecutionSessionResponse
{
    [JsonPropertyName("sessionId")]
    public required string SessionId { get; }

    [JsonPropertyName("executionSessionUrl")]
    public string? ExecutionSessionUrl { get; }

    [JsonPropertyName("language")]
    public required Language Language { get; }

    [JsonPropertyName("status")]
    public required ExecutionSessionStatus Status { get; }
}
