using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record RunningResponse
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("state")]
    public required RunningSubmissionState State { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
