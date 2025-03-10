using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record StoreTracedWorkspaceRequest
{
    [JsonPropertyName("workspaceRunDetails")]
    public required WorkspaceRunDetails WorkspaceRunDetails { get; set; }

    [JsonPropertyName("traceResponses")]
    public IEnumerable<TraceResponse> TraceResponses { get; set; } = new List<TraceResponse>();

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
