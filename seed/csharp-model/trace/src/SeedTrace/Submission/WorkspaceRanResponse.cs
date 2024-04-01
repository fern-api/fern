using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class WorkspaceRanResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("runDetails")]
    public WorkspaceRunDetails RunDetails { get; init; }
}
