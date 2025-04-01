using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

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

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
