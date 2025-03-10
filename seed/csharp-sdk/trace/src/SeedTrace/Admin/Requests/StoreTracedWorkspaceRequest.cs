using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record StoreTracedWorkspaceRequest
{
    [JsonPropertyName("workspaceRunDetails")]
    public required WorkspaceRunDetails WorkspaceRunDetails { get; set; }

    [JsonPropertyName("traceResponses")]
    public IEnumerable<TraceResponse> TraceResponses { get; set; } = new List<TraceResponse>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
