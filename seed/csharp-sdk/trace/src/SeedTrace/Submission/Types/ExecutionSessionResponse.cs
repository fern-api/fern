using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class ExecutionSessionResponse
{
    [JsonPropertyName("sessionId")]
    public string SessionId { get; init; }

    [JsonPropertyName("executionSessionUrl")]
    public string? ExecutionSessionUrl { get; init; }

    [JsonPropertyName("language")]
    public Language Language { get; init; }

    [JsonPropertyName("status")]
    public ExecutionSessionStatus Status { get; init; }
}
