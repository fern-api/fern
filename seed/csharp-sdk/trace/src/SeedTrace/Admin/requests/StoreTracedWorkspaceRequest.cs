using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class StoreTracedWorkspaceRequest
{
    [JsonPropertyName("workspaceRunDetails")]
    public WorkspaceRunDetails WorkspaceRunDetails { get; init; }

    [JsonPropertyName("traceResponses")]
    public IEnumerable<TraceResponse> TraceResponses { get; init; }
}
