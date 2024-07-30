using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record WorkspaceRanResponse
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("runDetails")]
    public required WorkspaceRunDetails RunDetails { get; set; }
}
