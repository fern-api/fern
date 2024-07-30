using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record GetExecutionSessionStateResponse
{
    [JsonPropertyName("states")]
    public Dictionary<string, ExecutionSessionState> States { get; set; } =
        new Dictionary<string, ExecutionSessionState>();

    [JsonPropertyName("numWarmingInstances")]
    public int? NumWarmingInstances { get; set; }

    [JsonPropertyName("warmingSessionIds")]
    public IEnumerable<string> WarmingSessionIds { get; set; } = new List<string>();
}
