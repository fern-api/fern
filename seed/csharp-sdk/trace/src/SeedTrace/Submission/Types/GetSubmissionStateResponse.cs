using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record GetSubmissionStateResponse
{
    [JsonPropertyName("timeSubmitted")]
    public DateTime? TimeSubmitted { get; set; }

    [JsonPropertyName("submission")]
    public required string Submission { get; set; }

    [JsonPropertyName("language")]
    public required Language Language { get; set; }

    [JsonPropertyName("submissionTypeState")]
    public required object SubmissionTypeState { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
