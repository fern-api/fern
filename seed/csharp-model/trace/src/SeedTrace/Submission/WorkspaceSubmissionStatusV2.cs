using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class WorkspaceSubmissionStatusV2
{
    [JsonPropertyName("updates")]
    public List<WorkspaceSubmissionUpdate> Updates { get; init; }
}
