using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class GetExecutionSessionStateResponse
{
    [JsonPropertyName("states")]
    public Dictionary<string, ExecutionSessionState> States { get; init; }

    [JsonPropertyName("numWarmingInstances")]
    public int? NumWarmingInstances { get; init; }

    [JsonPropertyName("warmingSessionIds")]
    public IEnumerable<string> WarmingSessionIds { get; init; }
}
