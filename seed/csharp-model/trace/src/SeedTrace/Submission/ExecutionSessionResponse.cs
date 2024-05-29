using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public class ExecutionSessionResponse
{
    [JsonPropertyName("sessionId")]
    public string SessionId { get; init; }

    [JsonPropertyName("executionSessionUrl")]
    public string? ExecutionSessionUrl { get; init; }

    [JsonPropertyName("language")]
    [JsonConverter(typeof(StringEnumSerializer<Language>))]
    public Language Language { get; init; }

    [JsonPropertyName("status")]
    [JsonConverter(typeof(StringEnumSerializer<ExecutionSessionStatus>))]
    public ExecutionSessionStatus Status { get; init; }
}
