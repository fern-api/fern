using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record BuildingExecutorResponse
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("status")]
    public required ExecutionSessionStatus Status { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
