using System.Text.Json.Serialization;
using Client;

namespace Client;

public class GetExecutionSessionStateResponse
{
    [JsonPropertyName("states")]
    public Dictionary<string, ExecutionSessionState> States { get; init; }

    [JsonPropertyName("numWarmingInstances")]
    public int? NumWarmingInstances { get; init; }

    [JsonPropertyName("warmingSessionIds")]
    public List<string> WarmingSessionIds { get; init; }
}
