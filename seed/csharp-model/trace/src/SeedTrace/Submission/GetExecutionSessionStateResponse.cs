using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class GetExecutionSessionStateResponse
{
    [JsonPropertyName("states")]
    public List<Dictionary<string, ExecutionSessionState>> States { get; init; }

    [JsonPropertyName("numWarmingInstances")]
    public List<int?> NumWarmingInstances { get; init; }

    [JsonPropertyName("warmingSessionIds")]
    public List<List<string>> WarmingSessionIds { get; init; }
}
