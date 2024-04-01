using System.Text.Json.Serialization;
using StringEnum;
using SeedTrace;

namespace SeedTrace;

public class ExecutionSessionResponse
{
    [JsonPropertyName("sessionId")]
    public string SessionId { get; init; }

    [JsonPropertyName("executionSessionUrl")]
    public string? ExecutionSessionUrl { get; init; }

    [JsonPropertyName("language")]
    public StringEnum<Language> Language { get; init; }

    [JsonPropertyName("status")]
    public StringEnum<ExecutionSessionStatus> Status { get; init; }
}
