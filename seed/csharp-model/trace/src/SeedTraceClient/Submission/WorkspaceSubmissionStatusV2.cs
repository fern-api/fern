using System.Text.Json.Serialization;
using SeedTraceClient;

namespace SeedTraceClient;

public class WorkspaceSubmissionStatusV2
{
    [JsonPropertyName("updates")]
    public List<WorkspaceSubmissionUpdate> Updates { get; init; }
}
