using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record WorkspaceRanResponse
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("runDetails")]
    public required WorkspaceRunDetails RunDetails { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
