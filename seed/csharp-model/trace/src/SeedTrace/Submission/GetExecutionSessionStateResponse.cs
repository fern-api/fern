using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record GetExecutionSessionStateResponse
{
    [JsonPropertyName("states")]
    public Dictionary<string, ExecutionSessionState> States { get; } =
        new Dictionary<string, ExecutionSessionState>();

    [JsonPropertyName("numWarmingInstances")]
    public int? NumWarmingInstances { get; }

    [JsonPropertyName("warmingSessionIds")]
    public IEnumerable<string> WarmingSessionIds { get; } = new List<string>();
}
