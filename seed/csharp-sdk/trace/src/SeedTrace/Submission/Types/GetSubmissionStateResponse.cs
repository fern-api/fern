using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class GetSubmissionStateResponse
{
    [JsonPropertyName("timeSubmitted")]
    public DateTime? TimeSubmitted { get; init; }

    [JsonPropertyName("submission")]
    public string Submission { get; init; }

    [JsonPropertyName("language")]
    public Language Language { get; init; }

    [JsonPropertyName("submissionTypeState")]
    public SubmissionTypeState SubmissionTypeState { get; init; }
}
