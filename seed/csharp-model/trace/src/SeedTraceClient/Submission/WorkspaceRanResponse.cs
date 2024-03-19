using System.Text.Json.Serialization
using SeedTraceClient

namespace SeedTraceClient

public class WorkspaceRanResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
    [JsonPropertyName("runDetails")]
    public WorkspaceRunDetails RunDetails { get; init; }
}
