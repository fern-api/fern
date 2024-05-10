using SeedTrace;

namespace SeedTrace;

public class StoreTracedWorkspaceRequest
{
    public WorkspaceRunDetails WorkspaceRunDetails { get; init; }

    public List<TraceResponse> TraceResponses { get; init; }
}
