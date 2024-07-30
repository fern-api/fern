using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record StoreTracedWorkspaceRequest
{
    [JsonPropertyName("workspaceRunDetails")]
    public required WorkspaceRunDetails WorkspaceRunDetails { get; set; }

    [JsonPropertyName("traceResponses")]
    public IEnumerable<TraceResponse> TraceResponses { get; set; } = new List<TraceResponse>();
}
